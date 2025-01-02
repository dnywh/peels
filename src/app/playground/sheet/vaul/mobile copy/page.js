'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import LoremIpsum from '@/components/LoremIpsum';


const snapPoints = ['300px', '355px', 1];

export default function VaulDrawer() {
    const [snap, setSnap] = useState(snapPoints[0]);

    return (
        <Drawer.Root snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
            <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                Open Drawer
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]">
                    <div className="p-4 bg-white rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                        <div className="max-w-md mx-auto">
                            <Drawer.Title className="font-medium mb-4 text-gray-900">This drawer will open the listing details</Drawer.Title>
                            <Drawer.Description className="text-gray-600 mb-2">
                                This drawer will open the listing details, if needed.
                            </Drawer.Description>

                            <LoremIpsum />

                            <Drawer.NestedRoot>
                                <Drawer.Trigger className="rounded-md mt-4 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">
                                    Open Second Drawer
                                </Drawer.Trigger>
                                <Drawer.Portal>
                                    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                                    <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] lg:h-[327px] h-full mt-24 max-h-[94%] fixed bottom-0 left-0 right-0">
                                        <div className="p-4 bg-white rounded-t-[10px] flex-1">
                                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                                            <div className="max-w-md mx-auto">
                                                <Drawer.Title className="font-medium mb-4 text-gray-900">This drawer is nested.</Drawer.Title>
                                                <Drawer.Description className="text-gray-600 mb-2">
                                                    If you pull this drawer down a bit, it&apos;ll scale the drawer underneath it as well.
                                                </Drawer.Description>
                                                <p>This drawer will render the chat, if needed.</p>
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
