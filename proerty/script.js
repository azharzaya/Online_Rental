// Sample Data to initialize the platform
const initialProperties = [
    { id: '1', title: 'Luxury Villa with Pool', price: 2500, location: 'Los Angeles', type: 'Villa', description: 'Beautiful 4 bed, 3 bath villa.', image: '/Users/subhashkumar/Downloads/PHOTO-2026-03-25-14-39-46.jpg' },
    { id: '2', title: 'Modern City Flat', price: 1200, location: 'New York', type: 'Flat', description: 'Cozy 2 bed flat in the city center.', image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d966ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
    { id: '3', title: 'Suburban Family House', price: 1800, location: 'Chicago', type: 'House', description: 'Spacious 3 bed house with a large backyard.', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
    { id: '4', title: 'Student PG', price: 500, location: 'Boston', type: 'PG', description: 'Shared accommodation for students. Utilities included.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }
];

// Initialize Database
if (!localStorage.getItem('properties')) {
    localStorage.setItem('properties', JSON.stringify(initialProperties));
}
if (!localStorage.getItem('favorites')) {
    localStorage.setItem('favorites', JSON.stringify([]));
}

// Core Functions
const getProperties = () => JSON.parse(localStorage.getItem('properties'));
const getFavorites = () => JSON.parse(localStorage.getItem('favorites'));
const saveFavorites = (favs) => localStorage.setItem('favorites', JSON.stringify(favs));

// Dark Mode Logic
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// Render Property Cards
function renderCards(properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const favorites = getFavorites();

    if (properties.length === 0) {
        container.innerHTML = '<p>No properties found.</p>';
        return;
    }

    properties.forEach(prop => {
        const isFav = favorites.includes(prop.id) ? 'active' : '';
        const heart = favorites.includes(prop.id) ? '❤️' : '🤍';
        
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <img src="${prop.image}" alt="${prop.title}">
            <button class="fav-btn ${isFav}" onclick="toggleFavorite('${prop.id}', event)">${heart}</button>
            <div class="card-content">
                <div class="card-title">${prop.title}</div>
                <div class="card-price">$${prop.price} / month</div>
                <p>📍 ${prop.location} | 🏠 ${prop.type}</p>
                <a href="details.html?id=${prop.id}" class="btn" style="display:block; text-align:center; margin-top:1rem;">View Details</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Toggle Favorite
window.toggleFavorite = function(id, event) {
    event.preventDefault(); // Prevent navigating if clicked inside an anchor tag (though we structured it outside)
    let favs = getFavorites();
    if (favs.includes(id)) {
        favs = favs.filter(favId => favId !== id);
        showToast("Removed from favorites");
    } else {
        favs.push(id);
        showToast("Added to favorites");
    }
    saveFavorites(favs);
    // Re-render to update heart icons
    if (document.getElementById('featured-grid')) initHome();
    if (document.getElementById('listings-grid')) executeFilters();
}

// ---- PAGE SPECIFIC LOGIC ----

// 1. Home Page
function initHome() {
    const properties = getProperties();
    // Show top 3 properties as featured
    renderCards(properties.slice(0, 3), 'featured-grid');

    const searchForm = document.getElementById('home-search');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loc = document.getElementById('search-loc').value;
            const type = document.getElementById('search-type').value;
            window.location.href = `listings.html?loc=${encodeURIComponent(loc)}&type=${encodeURIComponent(type)}`;
        });
    }
}

// 2. Listings Page
function initListings() {
    const urlParams = new URLSearchParams(window.location.search);
    const locParam = urlParams.get('loc') || '';
    const typeParam = urlParams.get('type') || '';

    if (locParam) document.getElementById('filter-loc').value = locParam;
    if (typeParam) document.getElementById('filter-type').value = typeParam;

    document.getElementById('filter-btn').addEventListener('click', executeFilters);
    executeFilters(); // Initial render
}

function executeFilters() {
    const loc = document.getElementById('filter-loc').value.toLowerCase();
    const type = document.getElementById('filter-type').value;
    const priceRange = document.getElementById('filter-price').value;
    const sort = document.getElementById('sort-price').value;

    let filtered = getProperties();

    if (loc) filtered = filtered.filter(p => p.location.toLowerCase().includes(loc));
    if (type) filtered = filtered.filter(p => p.type === type);
    
    if (priceRange === 'low') filtered = filtered.filter(p => p.price < 1000);
    else if (priceRange === 'mid') filtered = filtered.filter(p => p.price >= 1000 && p.price <= 2000);
    else if (priceRange === 'high') filtered = filtered.filter(p => p.price > 2000);

    if (sort === 'asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'desc') filtered.sort((a, b) => b.price - a.price);

    renderCards(filtered, 'listings-grid');
}

// 3. Details Page
const saveProperties = (props) => localStorage.setItem('properties', JSON.stringify(props));
const getPropertyById = (id) => getProperties().find(p => p.id === id);
const deletePropertyById = (id) => saveProperties(getProperties().filter(p => p.id !== id));

function initDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const property = getPropertyById(id);

    if (!property) {
        document.getElementById('details-container').innerHTML = '<h2>Property not found.</h2>';
        return;
    }

    document.getElementById('det-img').src = property.image;
    document.getElementById('det-title').textContent = property.title;
    document.getElementById('det-price').textContent = `$${property.price} / month`;
    document.getElementById('det-loc').textContent = `📍 Location: ${property.location}`;
    document.getElementById('det-type').textContent = `🏠 Type: ${property.type}`;
    document.getElementById('det-desc').textContent = property.description;

    const contactBtn = document.getElementById('contact-owner-btn');
    const editBtn = document.getElementById('edit-property-btn');
    const deleteBtn = document.getElementById('delete-property-btn');

    if (contactBtn) {
        const contactUrl = `contact.html?propertyId=${encodeURIComponent(property.id)}`;
        contactBtn.setAttribute('href', contactUrl);
        contactBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = contactUrl;
        });
    }

    if (editBtn) {
        const editUrl = `add-property.html?editId=${encodeURIComponent(property.id)}`;
        editBtn.setAttribute('href', editUrl);
        editBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = editUrl;
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this property?')) {
                deletePropertyById(property.id);
                showToast('Property deleted successfully');
                setTimeout(() => { window.location.href = 'listings.html'; }, 400);
            }
        });
    }
}

// 4. Add Property Page
function initAddProperty() {
    const form = document.getElementById('add-form');
    const submitBtn = document.getElementById('submit-btn');
    const idInput = document.getElementById('property-id');
    const imageUrlInput = document.getElementById('imageUrl');
    const imageFileInput = document.getElementById('imageFile');

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editId');
    let editMode = false;

    if (editId) {
        const property = getPropertyById(editId);
        if (property) {
            editMode = true;
            idInput.value = property.id;
            document.getElementById('title').value = property.title;
            document.getElementById('price').value = property.price;
            document.getElementById('location').value = property.location;
            document.getElementById('type').value = property.type;
            document.getElementById('description').value = property.description;
            imageUrlInput.value = property.image.startsWith('data:') ? '' : property.image;
            submitBtn.textContent = 'Update Property';
        }
    }

    const readImageValue = () => {
        if (imageFileInput.files && imageFileInput.files[0]) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(imageFileInput.files[0]);
            });
        }
        return Promise.resolve(imageUrlInput.value || 'https://via.placeholder.com/800x400?text=No+Image');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const properties = getProperties();
        const image = await readImageValue();

        if (editMode && idInput.value) {
            const existingIndex = properties.findIndex(p => p.id === idInput.value);
            if (existingIndex !== -1) {
                properties[existingIndex] = {
                    ...properties[existingIndex],
                    title: document.getElementById('title').value,
                    price: Number(document.getElementById('price').value),
                    location: document.getElementById('location').value,
                    type: document.getElementById('type').value,
                    description: document.getElementById('description').value,
                    image
                };
                saveProperties(properties);
                showToast('Property updated successfully');
                setTimeout(() => { window.location.href = `details.html?id=${encodeURIComponent(idInput.value)}`; }, 400);
                return;
            }
        }

        const newProp = {
            id: Date.now().toString(),
            title: document.getElementById('title').value,
            price: Number(document.getElementById('price').value),
            location: document.getElementById('location').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            image
        };

        properties.push(newProp);
        saveProperties(properties);
        showToast('Property added successfully');
        form.reset();
    });
}

// 5. Contact Page
function initContact() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    const property = propertyId ? getPropertyById(propertyId) : null;

    if (property) {
        const propertyInfo = document.getElementById('contact-property-info');
        const propertyInput = document.getElementById('contact-property');
        const propertyIdInput = document.getElementById('contact-property-id');
        if (propertyInfo && propertyInput && propertyIdInput) {
            propertyInfo.style.display = 'block';
            propertyInput.value = `${property.title} (${property.location})`;
            propertyIdInput.value = property.id;
        }
    }

    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name')?.value || '';
        const emailAddress = document.getElementById('email-address')?.value || '';
        const message = document.getElementById('message')?.value || '';
        const propertyTitle = property ? property.title : 'Property inquiry';
        const propertyLocation = property ? property.location : '';
        const phoneNumber = '6203466975';

        const whatsappText = [
            `Hello, I would like to inquire about ${propertyTitle}.`,
            fullName ? `Name: ${fullName}` : '',
            emailAddress ? `Email: ${emailAddress}` : '',
            propertyLocation ? `Location: ${propertyLocation}` : '',
            message ? `Message: ${message}` : ''
        ].filter(Boolean).join('\n');

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        if (property) {
            document.getElementById('contact-property-info').style.display = 'none';
        }
    });
}

// Router equivalent: Initialize based on elements present
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('featured-grid')) initHome();
    if (document.getElementById('listings-grid')) initListings();
    if (document.getElementById('details-container')) initDetails();
    if (document.getElementById('add-form')) initAddProperty();
    if (document.getElementById('contact-form')) initContact();
});