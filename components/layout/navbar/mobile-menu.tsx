'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

export default function MobileMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors md:hidden dark:border-neutral-700 dark:text-white"
      >
        <Bars3Icon className="h-4" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white pb-6 dark:bg-black">
              <div className="p-4">
                <button
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
                  onClick={closeMobileMenu}
                  aria-label="Close mobile menu"
                >
                  <XMarkIcon className="h-6" />
                </button>

                <ul className="flex flex-col gap-y-4">
                  <li>
                    <Link href="/search/mens-designer" className="nav-link text-lg">
                      Men
                    </Link>
                  </li>
                  <li>
                    <Link href="/search/womens-designer" className="nav-link text-lg">
                      Women
                    </Link>
                  </li>
                </ul>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
