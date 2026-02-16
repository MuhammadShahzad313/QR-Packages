const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Replace with your Publishable Key
const API_URL = '/api';

// --- AUTHENTICATION ---

async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed');
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Login successful!');
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user session
            window.location.href = 'index.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authLinks = document.getElementById('auth-links');
    if (authLinks) {
        if (user) {
            authLinks.innerHTML = `
                <span class="text-brandGold">Welcome, ${user.username}</span>
                <button onclick="logout()" class="hover:text-brandGold transition">Logout</button>
            `;
        } else {
            authLinks.innerHTML = `
                <a href="login.html" class="hover:text-brandGold transition">Login</a>
                <a href="register.html" class="hover:text-brandGold transition">Register</a>
            `;
        }
    }
}

// --- PRODUCTS & CART ---

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

let products = []; // Store fetched products globally

async function loadShop() {
    products = await fetchProducts();
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    // Filter Logic (Simple implementation)
    // In a real app, you might want to refactor this
    window.renderProducts = (category) => {
        productGrid.innerHTML = '';
        const filtered = category === 'All' ? products : products.filter(p => p.category === category);

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = "bg-white rounded-xl shadow-lg overflow-hidden group hover:-translate-y-2 transition-transform duration-300";
            card.innerHTML = `
                <div class="relative overflow-hidden h-64">
                    <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition"></div>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-xl text-brandNavy">${product.name}</h3>
                        <span class="bg-brandGold text-brandNavy text-xs font-bold px-2 py-1 rounded uppercase">${product.category}</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                    <div class="flex justify-between items-center border-t pt-4">
                        <div class="flex flex-col">
                            <span class="text-xs text-gray-500">Global Price</span>
                            <span class="font-bold text-green-600">${product.price_intl}</span>
                        </div>
                        <button onclick="addToCart(${product.id})" class="bg-brandNavy text-white px-4 py-2 rounded-lg hover:bg-brandGold hover:text-brandNavy transition flex items-center gap-2">
                            Add to Cart <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    };

    // Initial Render
    renderProducts('All');

    // Category Click Handlers
    document.querySelectorAll('#category-list li').forEach(li => {
        li.addEventListener('click', function () {
            // Remove active style from all
            document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('text-brandGold', 'font-bold'));
            // Add active style to clicked
            this.classList.add('text-brandGold', 'font-bold');
            renderProducts(this.getAttribute('data-category'));
        });
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        toggleCart();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-total');
    if (cartCount) cartCount.innerText = cart.length;

    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.innerHTML = '';
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = "flex justify-between items-center bg-gray-50 p-3 rounded mb-2";
                itemEl.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${item.image_url}" class="w-12 h-12 object-cover rounded">
                        <div>
                            <h4 class="font-bold text-sm text-brandNavy line-clamp-1">${item.name}</h4>
                            <p class="text-xs text-gray-500">${item.size}</p>
                        </div>
                    </div>
                    <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartContainer.appendChild(itemEl);
            });
        }
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Side Cart Toggle
function toggleCart() {
    const overlay = document.getElementById('cart-overlay');
    const sidebar = document.getElementById('cart-sidebar');
    if (overlay && sidebar) {
        overlay.classList.toggle('hidden');
        if (sidebar.classList.contains('translate-x-full')) {
            sidebar.classList.remove('translate-x-full');
        } else {
            sidebar.classList.add('translate-x-full');
        }
    }
}

// WhatsApp Checkout (Legacy) -- Redirects to checkout page now
function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Please add items first!");
    window.location.href = 'checkout.html';
}


// --- CHECKOUT PAGE LOGIC ---

let stripeElements;
let cardElement;

function initCheckout() {
    renderCheckoutItems();
    updateShipping();

    // Initialize Stripe logic only if on checkout page and Stripe is loaded
    if (document.getElementById('card-element') && typeof stripe !== 'undefined') {
        stripeElements = stripe.elements();
        cardElement = stripeElements.create('card');
        cardElement.mount('#card-element');
    }
}

function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Cart is empty.</p>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm">
            <div class="flex items-center gap-2">
                <img src="${item.image_url}" class="w-10 h-10 object-cover rounded">
                <span>${item.name} <span class="text-gray-500">x1</span></span>
            </div>
            <span class="font-bold">${parsePrice(item.price_intl)}</span>
        </div>
    `).join('');

    updateOrderTotal();
}

function parsePrice(priceStr) {
    if (!priceStr) return "$0.00";
    const match = priceStr.match(/[\d\.]+/);
    return match ? `$${match[0]}` : "$0.00";
}

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => {
        const price = parseFloat(parsePrice(item.price_intl).replace('$', ''));
        return total + price;
    }, 0);
}

function updateShipping() {
    const countryEl = document.getElementById('country');
    if (!countryEl) return;
    const country = countryEl.value;
    // Demo shipping logic
    const shippingPrice = country === 'PK' ? 2.00 : 15.00;
    const shippingEl = document.getElementById('shipping-price');
    if (shippingEl) shippingEl.innerText = `$${shippingPrice.toFixed(2)}`;
    updateOrderTotal();
}

function updateOrderTotal() {
    const subtotal = getCartTotal();
    const countryEl = document.getElementById('country');
    const country = countryEl ? countryEl.value : 'PK';
    const shipping = country === 'PK' ? 2.00 : 15.00;
    const total = subtotal + shipping;

    const subEl = document.getElementById('subtotal-price');
    const totalEl = document.getElementById('total-price');

    if (subEl) subEl.innerText = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

function togglePaymentGroups() {
    const method = document.querySelector('input[name="payment-method"]:checked').value;
    const localGroup = document.getElementById('payment-local');
    const stripeGroup = document.getElementById('payment-stripe');

    if (method === 'cod') {
        localGroup.classList.remove('hidden');
        stripeGroup.classList.add('hidden');
    } else {
        localGroup.classList.add('hidden');
        stripeGroup.classList.remove('hidden');
    }
}

async function handleCheckout(event) {
    event.preventDefault();
    const method = document.querySelector('input[name="payment-method"]:checked').value;
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.disabled = true;
    submitBtn.innerText = "Processing...";

    const orderData = {
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        shipping: {
            name: document.getElementById('full-name').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
        },
        total: parseFloat(document.getElementById('total-price').innerText.replace('$', '')),
        method: method
    };

    if (method === 'stripe') {
        const response = await fetch(`${API_URL}/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const { clientSecret } = await response.json();

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement }
        });

        if (result.error) {
            document.getElementById('card-errors').innerText = result.error.message;
            submitBtn.disabled = false;
            submitBtn.innerText = "Confirm Order";
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                completeOrder(orderData);
            }
        }
    } else {
        completeOrder(orderData);
    }
}

async function completeOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Order Placed Successfully!');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            alert('Failed to save order.');
        }
    } catch (error) {
        console.error(error);
        alert('Network error.');
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    updateCartUI();

    // Page specific init
    if (window.location.pathname.includes('shop.html')) {
        loadShop();
    }
    if (window.location.pathname.includes('checkout.html')) {
        initCheckout();
    }
});
