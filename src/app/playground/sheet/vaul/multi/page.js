'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import CheckboxUnit from '@/components/CheckboxUnit';
import Button from '@/components/Button';

export default function VaulDrawer() {
    const [platform, setPlatform] = useState("mobile");
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Drawer.Root direction={platform === "mobile" ? "bottom" : "right"} open={isOpen} onOpenChange={setIsOpen} handleOnly={platform === "desktop" && true}>
            <p>Foo</p>
            <CheckboxUnit
                id="platform"
                checked={platform === "desktop"}
                onChange={() => setPlatform(platform === "mobile" ? "desktop" : "mobile")}
            >
                Desktop layout (right)
            </CheckboxUnit>

            <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                Open the drawer
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content
                    className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 lg:h-fit max-h-[96%] fixed bottom-0 left-0 right-0"
                    style={{ '--initial-transform': 'calc(100% + 8px)' }}
                >
                    <div className="p-4 bg-white rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            <Drawer.Title className="font-medium mb-4 text-gray-900">Nested Drawers.</Drawer.Title>
                            <p className="text-gray-600 mb-2">
                                Nesting drawers creates a{' '}
                                <a href="https://sonner.emilkowal.ski/" target="_blank" className="underline">
                                    Sonner-like
                                </a>{' '}
                                stacking effect .
                            </p>
                            <p className="text-gray-600 mb-2">
                                You can nest as many drawers as you want. All you need to do is add a `Drawer.NestedRoot` component
                                instead of `Drawer.Root`.
                            </p>
                            <Button onClick={() => setIsOpen(false)}>
                                Close this drawer
                            </Button>
                            <Drawer.Close />
                            <Drawer.NestedRoot direction={platform === "mobile" ? "bottom" : "right"}>
                                <Drawer.Trigger className="rounded-md mt-4 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">
                                    Open Second Drawer
                                </Drawer.Trigger>

                                <Drawer.Portal>
                                    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                                    <Drawer.Content
                                        className="bg-gray-100 flex flex-col rounded-t-[10px] lg:h-[327px] h-full mt-24 max-h-[94%] fixed bottom-0 left-0 right-0"
                                        style={{ '--initial-transform': 'calc(100% + 8px)' }}
                                    >
                                        <div className="p-4 bg-white rounded-t-[10px] flex-1">
                                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                                            <div className="max-w-md mx-auto">
                                                <Drawer.Title className="font-medium mb-4 text-gray-900">This drawer is nested.</Drawer.Title>
                                                <p className="text-gray-600 mb-2">
                                                    If you pull this drawer down a bit, it&apos;ll scale the drawer underneath it as well.
                                                </p>
                                            </div>
                                        </div>
                                    </Drawer.Content>
                                </Drawer.Portal>
                            </Drawer.NestedRoot>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
