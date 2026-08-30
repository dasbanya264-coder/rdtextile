import fs from 'fs';

let content = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

if (!content.includes('controlsList="nodownload"')) {
  content = content.replace(
    '<video src={activeMedia.url} controls className="w-full h-full object-contain bg-black" />',
    '<video src={activeMedia.url} controls controlsList="nodownload" autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />'
  );
  fs.writeFileSync('src/pages/ProductDetail.tsx', content);
}
