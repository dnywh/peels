'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import LoremIpsum from '@/components/LoremIpsum';

import Button from '@/components/Button';
import IconButton from '@/components/IconButton';

const snapPoints = ['148px', '355px', 1];

export default function VaulDrawer() {
    const [snap, setSnap] = useState(snapPoints[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open) => {
        console.log('about to open?', open)

        if (open) {
            console.log('opening. Resetting snap point')
            setSnap(snapPoints[0])
        }
        setIsOpen(open)
    }

    return (
        <>
            {/* <Button onClick={() => {
                console.log('open')
                setSnap(snapPoints[0])
                setIsOpen(true)
            }}>Open drawer only</Button>
            <Button onClick={() => {
                console.log('close')
                // setSnap(snapPoints[0])
                setIsOpen(false)
            }}>Close drawer only</Button> */}

            <Drawer.Root snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap} modal={false} open={isOpen} onOpenChange={handleOpenChange}>

                <Drawer.Trigger
                    // onClick={() => setSnap(snapPoints[0])} // Set back to initial snap point, in case it was closed from some other one
                    className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
                    Open or close Drawer
                </Drawer.Trigger>

                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Portal>
                    <Drawer.Content
                        data-testid="content"
                        className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px]"
                    >

                        <div
                            className={`flex flex-col max-w-md mx-auto w-full p-4 pt-5 ${snap === 1 ? 'overflow-y-auto' : 'overflow-hidden'}`}
                        >
                            <IconButton onClick={() => {
                                setIsOpen(false)
                            }} />
                            <Drawer.Title className="text-2xl mt-2 font-medium text-gray-900">The Hidden Details</Drawer.Title>
                            <p className="text-sm mt-1 text-gray-600 mb-6">40 videos, 20+ exercises</p>
                            <Drawer.Description>Hello</Drawer.Description>
                            <button className="bg-black text-gray-50 mt-8 rounded-md h-[48px] flex-shrink-0 font-medium">
                                Buy for $199
                            </button>
                            <div className="mt-12">
                                <h2 className="text-xl font-medium text-gray-900">Module 01. The Details</h2>
                                <div className="space-y-4 mt-4">
                                    <div>
                                        <span className="block text-gray-900">Layers of UI</span>
                                        <span className="text-gray-600">A basic introduction to Layers of Design.</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-900">Typography</span>
                                        <span className="text-gray-600">The fundamentals of type.</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-900">UI Animations</span>
                                        <span className="text-gray-600">Going through the right easings and durations.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <figure>
                                    <blockquote className="font-serif text-gray-900">
                                        “I especially loved the hidden details video. That was so useful, learned a lot by just reading it.
                                        Can&rsquo;t wait for more course content!”
                                    </blockquote>
                                    <figcaption>
                                        <span className="text-sm text-gray-600 mt-2 block">Yvonne Ray, Frontend Developer</span>
                                    </figcaption>
                                </figure>
                            </div>
                            <div className="mt-12">
                                <h2 className="text-xl font-medium text-gray-900">Module 02. The Process</h2>
                                <div className="space-y-4 mt-4">
                                    <div>
                                        <span className="block text-gray-900">Build</span>
                                        <span className="text-gray-600">Create cool components to practice.</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-900">User Insight</span>
                                        <span className="text-gray-600">Find out what users think and fine-tune.</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-900">Putting it all together</span>
                                        <span className="text-gray-600">Let&apos;s build an app together and apply everything.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
}
