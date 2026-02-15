
import { VaultItem } from '../types';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const convertToCSV = (items: VaultItem[]): string => {
  const header = ['ID', 'Type', 'Title', 'Username', 'Password', 'Provider', 'Remarks', 'Created At'];
  const rows = items.map(item => [
    item.id,
    item.type,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${(item.username || '').replace(/"/g, '""')}"`,
    `"${(item.password || '').replace(/"/g, '""')}"`,
    item.provider || '',
    `"${(item.remarks || '').replace(/"/g, '""')}"`,
    new Date(item.createdAt).toISOString()
  ]);

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const convertToTXT = (items: VaultItem[]): string => {
  return items.map(item => `
--------------------------------------------------
TITLE: ${item.title}
TYPE: ${item.type}
USERNAME: ${item.username || 'N/A'}
PASSWORD: ${item.password || 'N/A'}
PROVIDER: ${item.provider || 'N/A'}
REMARKS: ${item.remarks || 'N/A'}
CREATED: ${new Date(item.createdAt).toLocaleString()}
--------------------------------------------------
`).join('\n');
};

export const exportToXLSX = (items: VaultItem[], filename: string) => {
  const data = items.map(item => ({
    Type: item.type,
    Title: item.title,
    Username: item.username || '',
    Password: item.password || '',
    Provider: item.provider || '',
    Remarks: item.remarks || '',
    Created: new Date(item.createdAt).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vault Items");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToDOCX = async (items: VaultItem[], filename: string) => {
  const children = [];

  children.push(new Paragraph({
    text: "Quantum Authentication Vault Export",
    heading: HeadingLevel.TITLE,
    spacing: { after: 300 }
  }));

  items.forEach(item => {
    children.push(new Paragraph({
      text: item.title,
      heading: HeadingLevel.HEADING_2
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: "Type: ", bold: true }),
        new TextRun(item.type)
      ]
    }));
    if(item.username) {
        children.push(new Paragraph({
            children: [
                new TextRun({ text: "Username: ", bold: true }),
                new TextRun(item.username)
            ]
        }));
    }
    if(item.password) {
        children.push(new Paragraph({
            children: [
                new TextRun({ text: "Password: ", bold: true }),
                new TextRun(item.password)
            ]
        }));
    }
    if(item.remarks) {
        children.push(new Paragraph({
            children: [
                new TextRun({ text: "Remarks: ", bold: true }),
                new TextRun(item.remarks)
            ]
        }));
    }
    children.push(new Paragraph({ text: "" })); // Spacer
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportToPDF = (items: VaultItem[], filename: string) => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFillColor(8, 51, 68);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(34, 211, 238);
    doc.setFont("courier", "bold");
    doc.text("QUANTUM VAULT EXPORT", 10, 13);
    doc.setTextColor(0, 0, 0);
    y += 10;

    items.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${item.title} (${item.type})`, 10, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        if(item.username) {
            doc.text(`   User: ${item.username}`, 10, y);
            y += 5;
        }
        if(item.password) {
            doc.text(`   Pass: ${item.password}`, 10, y);
            y += 5;
        }
        if(item.remarks) {
            doc.text(`   Note: ${item.remarks}`, 10, y);
            y += 5;
        }
        y += 5;
    });

    doc.save(`${filename}.pdf`);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
