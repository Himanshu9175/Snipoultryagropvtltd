import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Dashboard System. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-neutral-500 hover:text-neutral-700">
              <span className="sr-only">Privacy</span>
              Privacy Policy
            </Link>
            <Link href="#" className="text-neutral-500 hover:text-neutral-700">
              <span className="sr-only">Terms</span>
              Terms of Service
            </Link>
            <Link href="#" className="text-neutral-500 hover:text-neutral-700">
              <span className="sr-only">Contact</span>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
