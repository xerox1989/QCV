#!/bin/bash
echo "-----------------------------------------------"
echo "🔍 SHAON NEXUS: PROJECT HEALTH CHECKER (2026)"
echo "-----------------------------------------------"

# ১. ফাইল স্ট্রাকচার চেক
echo "[1] Checking File Structure..."
FILES=("index.html" "src/index.tsx" "src/App.tsx" "src/types.ts" "package.json" "vite.config.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ MISSING: $file"
    fi
done

# ২. সার্ভিস ফোল্ডার চেক
echo -e "\n[2] Checking Services..."
if [ -d "src/services" ]; then
    echo "✅ src/services folder exists."
    ls src/services
else
    echo "❌ src/services folder NOT FOUND!"
fi

# ৩. index.html পাথ চেক
echo -e "\n[3] Checking index.html script path..."
grep -H "src=" index.html

# ৪. App.tsx ইমপোর্ট পাথ চেক
echo -e "\n[4] Checking App.tsx imports..."
grep "from" src/App.tsx | head -n 5

# ৫. নেটলিফাই সেটিংস চেক
echo -e "\n[5] Checking Netlify config..."
if [ -f "netlify.toml" ]; then
    cat netlify.toml
else
    echo "⚠️ netlify.toml not found (Optional but recommended)"
fi

echo -e "\n-----------------------------------------------"
echo "💡 শাউন, রিপোর্ট শেষ। এরর থাকলে উপরে লাল ক্রস (❌) দেখুন।"
echo "-----------------------------------------------"
