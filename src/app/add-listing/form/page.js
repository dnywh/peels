'use client'

import React, { Suspense, useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useSearchParams } from 'next/navigation'
import SwitchToggle from "@/components/SwitchToggle";
import CheckboxUnit from "@/components/CheckboxUnit";

function NewListingFormContent() {
    const searchParams = useSearchParams()
    const listingType = searchParams.get('type') === 'community' || searchParams.get('type') === 'business' ? searchParams.get('type') : 'residential'

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [address, setAddress] = useState('')
    const [acceptedItems, setAcceptedItems] = useState('')
    const [rejectedItems, setRejectedItems] = useState('')
    const [photos, setPhotos] = useState([])
    const [links, setLinks] = useState([])
    const [visibility, setVisibility] = useState(true)
    const [legal, setLegal] = useState(false)

    function handleSubmit(event) {
        event.preventDefault()
        console.log('Form submitted with: ', { name }, { description }, { photos })
    }

    return (
        <main>
            <header>
                <BackButton />
                <h1>List your {listingType}</h1>
                <p>Description here.</p>
            </header>
            <form onSubmit={handleSubmit}>
                <div>
                    <h2>Basics</h2>
                    <label htmlFor="name">Place name</label>
                    <input
                        id="name"
                        required={true}
                        type="text"
                        placeholder="Your community’s name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />

                    <label htmlFor="address">Address</label>
                    <input id="address"
                        required={true}
                        type="text"
                        placeholder="Your community’s address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                    />

                    <label htmlFor="description">Description <span>(optional)</span></label>
                    <textarea
                        id="description"
                        required={true}
                        placeholder="Description here"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <div>
                    <h2>Composting details</h2>
                    <p>Be specific so people know exactly what should be avoided. Enter items separately so it’s easier to read.</p>

                    <label htmlFor="acceptedItems">What scraps do you accept?</label>
                    <input
                        id="acceptedItems"
                        required={true}
                        type="text"
                        placeholder="Something you accept (e.g. ‘fruit rinds’)"
                        value={acceptedItems}
                        onChange={(event) => setAcceptedItems(event.target.value)}
                    />
                    <button type="button">Add another</button>

                    <label htmlFor="rejectedItems">What scraps do you <em>not</em> accept? <span>(optional)</span></label>
                    <input
                        id="rejectedItems"
                        type="text"
                        placeholder="Something you don’t accept (e.g. ‘meat’)"
                        value={rejectedItems}
                        onChange={(event) => setRejectedItems(event.target.value)}
                    />
                    <button type="button">Add another</button>
                </div>
                <div>
                    <h2>Media</h2>
                    <p>Optionally show a bit more about your community project to Peels members.</p>

                    <label htmlFor="photos">Photos <span>(optional)</span></label>
                    <input
                        id="image-1"
                        type="file"
                        accept="image/*"
                        multiple={true}
                        value={photos}
                        onChange={(event) => setPhotos(event.target.value)}
                    />

                    <label htmlFor="links">Links <span>(optional)</span></label>
                    <input
                        id="link-1"
                        type="url"
                        placeholder="https://www.example.com"
                        value={links}
                        onChange={(event) => setLinks(event.target.value)}
                    />
                </div>

                <div>
                    <h2>Visibility</h2>
                    <p>Switch this off if you need to take a break from Peels.</p>
                    {/* onChange event is handled differently because Radix Switch provides a direct boolean value in its change handler. */}
                    <SwitchToggle id="visibility" label="Show on map" checked={visibility} onChange={(checked) => setVisibility(checked)} />




                </div>

                <div>
                    <CheckboxUnit id="legal" checked={legal} required={true} onChange={(event) => setLegal(event.target.checked)} >
                        I have read and accept the Peels <Link href="/terms-of-use" target="_blank"> Terms of Use</Link> and <Link href="/privacy-policy" target="_blank">Privacy Policy</Link>
                    </CheckboxUnit>
                </div>
                <button type="submit">Add listing</button>
            </form>
        </main >
    )
}

function NewListingFormPage() {

    return (


        <Suspense fallback={<div>Loading...</div>}>
            <NewListingFormContent />
        </Suspense>

    );
}

export default NewListingFormPage;
