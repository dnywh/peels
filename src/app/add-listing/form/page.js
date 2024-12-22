'use client'

import React, { Suspense, useState } from "react";
import { createClient } from '@/utils/supabase/client'

import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useSearchParams } from 'next/navigation'
import SwitchToggle from "@/components/SwitchToggle";
import CheckboxUnit from "@/components/CheckboxUnit";
// import { error } from "console";

async function uploadPhoto(file) {
    const supabase = createClient()

    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage
        .from('listing_photos')
        .upload(fileName, file)

    if (error) throw error

    // Return just the filename instead of full URL
    return fileName
}

async function uploadAvatar(file) {
    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { data, error } = await supabase.storage
        .from('listing_avatars')
        .upload(fileName, file)

    if (error) throw error

    return fileName
}

// Add a helper function to get URLs when needed
function getPhotoUrl(filename) {
    const supabase = createClient()
    const { data: { publicUrl } } = supabase.storage
        .from('listing_photos')
        .getPublicUrl(filename)
    return publicUrl
}

function getAvatarUrl(filename) {
    const supabase = createClient()
    const { data: { publicUrl } } = supabase.storage
        .from('listing_avatars')
        .getPublicUrl(filename)
    return publicUrl
}

async function deleteAvatar(filePath) {
    const supabase = createClient()
    const { error } = await supabase.storage
        .from('listing_avatars')
        .remove([filePath])

    if (error) throw error
}

function NewListingFormContent() {
    const searchParams = useSearchParams()
    const listingType = searchParams.get('type') === 'community' || searchParams.get('type') === 'business' ? searchParams.get('type') : 'residential'

    const [avatar, setAvatar] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    // const [address, setAddress] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [acceptedItems, setAcceptedItems] = useState([''])
    const [rejectedItems, setRejectedItems] = useState([''])
    const [photos, setPhotos] = useState([])
    const [links, setLinks] = useState([])
    const [visibility, setVisibility] = useState(true)
    const [legal, setLegal] = useState(false)

    const handleAcceptedItemChange = (index, value) => {
        const newItems = [...acceptedItems]
        newItems[index] = value
        setAcceptedItems(newItems)
    }

    const handleRejectedItemChange = (index, value) => {
        const newItems = [...rejectedItems]
        newItems[index] = value
        setRejectedItems(newItems)
    }

    const addAcceptedItem = () => {
        if (acceptedItems.length < 10) {
            setAcceptedItems([...acceptedItems, ''])
        }
    }

    const addRejectedItem = () => {
        if (rejectedItems.length < 10) {
            setRejectedItems([...rejectedItems, ''])
        }
    }

    const handlePhotoChange = async (event) => {
        const files = Array.from(event.target.files)
        try {
            const uploadPromises = files.map(uploadPhoto)
            const uploadedUrls = await Promise.all(uploadPromises)
            setPhotos(uploadedUrls)
        } catch (error) {
            console.error('Error uploading photos:', error)
            // Show error message to user
        }
    }

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0]
        if (file) {
            try {
                // If there's an existing avatar, delete it first
                if (avatar) {
                    // Extract the file path from the URL
                    const existingFilePath = avatar.split('/').pop()
                    await deleteAvatar(existingFilePath)
                }

                const avatarUrl = await uploadAvatar(file)
                setAvatar(avatarUrl)
            } catch (error) {
                console.error('Error handling avatar:', error)
                // Show error message to user
            }
        }
    }

    const handleAvatarDelete = async () => {
        if (avatar) {
            try {
                const filePath = avatar.split('/').pop()
                await deleteAvatar(filePath)
                setAvatar('')
            } catch (error) {
                console.error('Error deleting avatar:', error)
                // Show error message to user
            }
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        // TODO: clear form
        // TODO: submit to database
        // console.log('Form submitting with: ', { name }, { description }, { photos })
        try {
            const supabase = createClient()
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            // if (userError) throw userError

            // Prepare the listing data
            const listingData = {
                user_id: user.id,
                type: listingType,
                avatar,
                name,
                description,
                location: `POINT(${longitude} ${latitude})`,
                // accepted_items: acceptedItems ? [acceptedItems] : [],
                // rejected_items: rejectedItems ? [rejectedItems] : [],
                // Filter out rejected items:
                accepted_items: acceptedItems.filter(item => item.trim() !== ''),
                rejected_items: rejectedItems.filter(item => item.trim() !== ''),
                photos,
                links: links ? [links] : [],
                visibility: visibility
            }

            // Insert the listing into the database
            const { data, error } = await supabase
                .from('listings')
                .insert(listingData)
                .select()
                .single()

            if (error) throw error

            // Clear form and show success
            console.log('Listing created:', data)
            // Reset form
            setName('')
            setAvatar('')
            setDescription('')
            setLongitude('')
            setLatitude('')
            // setAddress('')
            setAcceptedItems([''])
            setRejectedItems([''])
            setPhotos([])
            setLinks([])
            setVisibility(true)
            setLegal(false)

            // TODO: redirect to listings page and show success toast

        } catch (error) {
            console.error('Error creating listing:', error)
        }





    }

    return (
        <main>
            <header>
                <BackButton />
                <h1>List your {listingType}</h1>
                <p>Description here.</p>
            </header>
            <form onSubmit={handleSubmit}>
                <label htmlFor="avatar">Avatar <span>(optional)</span></label>
                <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    multiple={false}
                    onChange={handleAvatarChange}
                />
                {avatar && (
                    <div>
                        <img src={getAvatarUrl(avatar)} alt="Listing avatar" style={{ width: '100px' }} />
                        <button type="button" onClick={handleAvatarDelete}>
                            Remove avatar
                        </button>
                    </div>
                )}

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

                    {/* <label htmlFor="address">Address</label>
                    <input id="address"
                        required={true}
                        type="text"
                        placeholder="Your community’s address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                    /> */}

                    <label htmlFor="longitude">Longitude</label>
                    <input id="longitude"
                        required={true}
                        type="number"
                        value={longitude}
                        onChange={(event) => setLongitude(event.target.value)}
                    />

                    <label htmlFor="latitude">Latitude</label>
                    <input id="latitude"
                        required={true}
                        type="number"
                        value={latitude}
                        onChange={(event) => setLatitude(event.target.value)}
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
                    {acceptedItems.map((item, index) => (
                        <div key={`accepted-${index}`}>
                            <input
                                id={`acceptedItems-${index}`}
                                required={index === 0}
                                type="text"
                                placeholder="Something you accept (e.g. 'fruit rinds')"
                                value={item}
                                onChange={(e) => handleAcceptedItemChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                    {acceptedItems.length < 10 && (
                        <button type="button" onClick={addAcceptedItem}>
                            Add another
                        </button>
                    )}

                    <label htmlFor="rejectedItems">What scraps do you <em>not</em> accept? <span>(optional)</span></label>
                    {rejectedItems.map((item, index) => (
                        <div key={`rejected-${index}`}>
                            <input
                                id={`rejectedItems-${index}`}
                                type="text"
                                placeholder="Something you don't accept (e.g. 'meat')"
                                value={item}
                                onChange={(e) => handleRejectedItemChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                    {rejectedItems.length < 10 && (
                        <button type="button" onClick={addRejectedItem}>
                            Add another
                        </button>
                    )}
                </div>
                <div>
                    <h2>Media</h2>
                    <p>Optionally show a bit more about your community project to Peels members.</p>

                    <label htmlFor="photos">Additional photos <span>(optional)</span></label>
                    <input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple={true}
                        onChange={handlePhotoChange}
                    />
                    {photos.length > 0 && (
                        <div>
                            {photos.map((filename, index) => (
                                <img
                                    key={index}
                                    src={getPhotoUrl(filename)}
                                    alt={`Photo ${index + 1}`}
                                    style={{ width: '100px' }}
                                />
                            ))}
                        </div>
                    )}

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
