import os
import re

def fix_imports_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all component imports to marketing
    content = re.sub(
        r'from "@/components/site-header"',
        r'from "@/components/marketing/site-header"',
        content
    )
    content = re.sub(
        r'from "@/components/site-footer"',
        r'from "@/components/marketing/site-footer"',
        content
    )
    content = re.sub(
        r'from "@/components/features/',
        r'from "@/components/marketing/features/',
        content
    )
    
    # Also fix single quotes
    content = re.sub(
        r"from '@/components/site-header'",
        r"from '@/components/marketing/site-header'",
        content
    )
    content = re.sub(
        r"from '@/components/site-footer'",
        r"from '@/components/marketing/site-footer'",
        content
    )
    content = re.sub(
        r"from '@/components/features/",
        r"from '@/components/marketing/features/",
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

# Fix all page.tsx files in marketing
marketing_dir = "frontend/src/app/(marketing)"

for root, dirs, files in os.walk(marketing_dir):
    for file in files:
        if file == "page.tsx":
            filepath = os.path.join(root, file)
            fix_imports_in_file(filepath)
            print(f"Fixed: {filepath}")

print("\nDone!")
