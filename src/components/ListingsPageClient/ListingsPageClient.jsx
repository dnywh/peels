function ListingsPageClient({ listing }) {
  console.log("ListingsPageClient rendered", listing);

  // Single listing view
  if (listing) {
    return (
      <div>
        <h2>{listing.title}</h2>
        {/* Add your single listing view here */}
        <pre>{JSON.stringify(listing, null, 2)}</pre>
      </div>
    );
  }

  // Backup listing index view
  // return (
  //   <div>
  //     <h2>All Listings</h2>
  //     <p>Go to the map to view all listings</p>
  //   </div>
  // );
}

export default ListingsPageClient;
