import Link from 'next/link';

export default function Footer() {
  // Replace with your actual portfolio link
  const portfolioUrl = "https://imajay.pro"; 

  return (
    <footer className="mt-auto py-4 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
      Interested in hiring me? Visit my{' '}
      <Link href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4 hover:text-black dark:hover:text-white">
        portfolio
      </Link>.
    </footer>
  );
}