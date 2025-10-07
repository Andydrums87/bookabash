// replace-suppliers.js
const fs = require('fs');
const path = require('path');

// Files to update (based on your search results)
const filesToUpdate = [
  'src/app/(main)/payment/PaymentPageContent.jsx',
  'src/app/(main)/payment/secure-party/secure-party-client.jsx',
  'src/app/admin/verification/page.js',
  'src/app/api/admin/verification/list/route.js',
  'src/app/suppliers/UserMenu.jsx',
  'src/app/suppliers/hooks/useAllSupplierEnquries.js',
  'src/components/SupplierChatTabs.jsx',
  'src/components/SupplierMessagesSection.jsx',
  'src/contexts/BusinessContext.jsx',
  'src/contexts/SupplierAuthContext.js',
  'src/utils/mockBackend.js',
  'src/utils/partyDatabaseBackend.js',
  'src/utils/supplierEnquiryBackend.js',
];

// Patterns to replace - ONLY for SELECT queries
const replacePattern = /\.from\('suppliers'\)\.select/g;
const replacement = ".from('suppliers_secure').select";

let totalReplacements = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(replacePattern);
  
  if (matches) {
    content = content.replace(replacePattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file} (${matches.length} replacement${matches.length > 1 ? 's' : ''})`);
    totalReplacements += matches.length;
  } else {
    console.log(`ℹ️  No changes in ${file}`);
  }
});

console.log(`\n🎉 Done! Made ${totalReplacements} replacements across ${filesToUpdate.length} files.`);
console.log('\n⚠️  IMPORTANT: Review the changes and test your app!');