const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let products = window.SAREES || [];
const cartKey = "tharinayambyaisha-cart-v1";
const whatsappNumber = "919500775331";
let cart = loadCart();
let activeProduct = null;
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const hasPrice = p => Number.isFinite(p.price) && p.price > 0;
function loadCart(){try{return JSON.parse(localStorage.getItem(cartKey)||"[]").filter(x=>products.some(p=>p.id===x.id&&!p.sold&&hasPrice(p))&&Number.isInteger(x.qty)&&x.qty>0)}catch{return []}}
function saveCart(){localStorage.setItem(cartKey,JSON.stringify(cart))}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function priceMarkup(p){
 if(!hasPrice(p))return '<div class="price-tag price-unavailable">Price to be confirmed</div>';
 const originalPrice=Number.isFinite(p.originalPrice)&&p.originalPrice>p.price?p.originalPrice:null;
 const discount=originalPrice?Math.round((originalPrice-p.price)/originalPrice*100):0;
 return `<div class="price-tag"><strong>${money(p.price)}</strong>${originalPrice?`<span class="original-price">${money(originalPrice)}</span><span class="discount-badge">${discount}% off</span>`:""}</div>`;
}
function cartSubtotal(){
 return cart.reduce((total,item)=>{
  const product=products.find(p=>p.id===item.id);
  return product&&hasPrice(product)?total+product.price*item.qty:NaN;
 },0);
}
function renderOptions(){
 const selectedColor=$("#colorFilter").value, selectedOccasion=$("#occasionFilter").value;
 $("#colorFilter").innerHTML='<option value="">All colours</option>';
 $("#occasionFilter").innerHTML='<option value="">All occasions</option>';
 const colors=[...new Set(products.map(p=>p.color.split(/\s+(?:with|and)\s+/i)[0]).filter(Boolean))].sort();
 colors.forEach(v=>$("#colorFilter").insertAdjacentHTML("beforeend",`<option value="${safe(v)}">${safe(v)}</option>`));
 const occ=[...new Set(products.flatMap(p=>p.occasion.split(",").map(x=>x.trim())))].sort();
 occ.forEach(v=>$("#occasionFilter").insertAdjacentHTML("beforeend",`<option value="${safe(v)}">${safe(v)}</option>`));
 $("#colorFilter").value=selectedColor;
 $("#occasionFilter").value=selectedOccasion;
}
function visibleProducts(){
 const q=$("#searchInput").value.trim().toLowerCase(), color=$("#colorFilter").value, occasion=$("#occasionFilter").value, sort=$("#sortSelect").value;
 let arr=products.filter(p=>{
  const hay=[p.id,p.name,p.tagline,p.description,p.color,p.body,p.border,p.occasion].join(" ").toLowerCase();
  const colorOk=!color||p.color.toLowerCase().startsWith(color.toLowerCase());
  const occasionOk=!occasion||p.occasion.toLowerCase().split(",").map(x=>x.trim()).includes(occasion.toLowerCase());
  return (!q||hay.includes(q))&&colorOk&&occasionOk;
 });
 if(sort==="az")arr.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==="za")arr.sort((a,b)=>b.name.localeCompare(a.name));
 return arr;
}
function renderProducts(){
 const arr=visibleProducts(); $("#resultCount").textContent=arr.length;
 $("#productGrid").innerHTML=arr.map(p=>`<article class="product-card">
  <div class="product-image-wrap"><img class="product-image" src="${safe(p.image)}" alt="${safe(p.name)} saree" loading="lazy"><span class="product-id">${safe(p.id)}</span>${p.sold?'<span class="sold-badge">Sold</span>':""}<button class="quick-view" data-view="${safe(p.id)}">View details ↗</button></div>
  <div class="product-info"><div class="product-title-row"><h3 class="product-title">${safe(p.name)}</h3></div><p class="product-tagline">${safe(p.tagline)}</p>
  <p class="product-fabric">${safe(p.fabric||"Fabric not specified")}</p>
  <div class="product-bottom">${priceMarkup(p)}${p.sold?'<button class="add-button" disabled>Sold out</button>':hasPrice(p)?`<button class="add-button" data-add="${safe(p.id)}">＋ Add to bag</button>`:'<button class="add-button" disabled>Unavailable</button>'}</div></div></article>`).join("");
 $("#emptyState").hidden=arr.length>0; $("#productGrid").hidden=arr.length===0;
}
function openCart(){ $("#overlay").classList.add("visible");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";renderCart()}
function closeCart(){ $("#overlay").classList.remove("visible");$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow=""}
function updateCart(){saveCart();$("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);renderCart()}
function addToCart(id,qty=1){const product=products.find(p=>p.id===id);if(!product||product.sold||!hasPrice(product))return;const item=cart.find(x=>x.id===id);if(item)item.qty+=qty;else cart.push({id,qty});updateCart();openCart()}
function renderCart(){
 const host=$("#cartItems");
 if(!cart.length){host.innerHTML='<div class="empty-cart"><strong>Your bag is waiting.</strong>Explore the collection and add a saree you love.<br><button class="button button-dark" id="cartContinue" style="margin-top:18px">Continue shopping →</button></div>';$("#cartSubtotal").textContent=money(0);$("#cartTotal").textContent=money(0);return}
 host.innerHTML=cart.map(x=>{const p=products.find(y=>y.id===x.id);return `<div class="cart-row"><img src="${safe(p.image)}" alt="${safe(p.name)}"><div><h4>${safe(p.name)}</h4><p>${safe(p.id)} · ${money(p.price)} each</p><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div><br><button class="remove-button" data-remove="${p.id}">Remove</button></div><span class="cart-line-total">${money(p.price*x.qty)}</span></div>`}).join("");
 const subtotal=cartSubtotal();
 $("#cartSubtotal").textContent=money(subtotal);$("#cartTotal").textContent=money(subtotal);
}
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;activeProduct=p;$("#productModalContent").innerHTML=`<div class="detail-layout"><img class="detail-image" src="${safe(p.image)}" alt="${safe(p.name)}"><div class="detail-content"><p class="eyebrow">${safe(p.id)} · THE COLLECTION</p><h2>${safe(p.name)}</h2><p class="detail-tagline">${safe(p.tagline)}</p>${priceMarkup(p)}<p class="product-fabric">${safe(p.fabric||"Fabric not specified")}</p><p class="detail-desc">${safe(p.description)}</p><div class="detail-specs"><div class="spec-row"><span>Colour</span><span>${safe(p.color)}</span></div><div class="spec-row"><span>Body</span><span>${safe(p.body)}</span></div><div class="spec-row"><span>Border & pallu</span><span>${safe(p.border)}</span></div><div class="spec-row"><span>Look & feel</span><span>${safe(p.look)}</span></div><div class="spec-row"><span>Occasion</span><span>${safe(p.occasion)}</span></div><div class="spec-row"><span>Fabric</span><span>${safe(p.fabric||"Not specified")}</span></div></div><div class="detail-actions">${p.sold?'<button class="button button-dark" disabled>Sold out</button>':hasPrice(p)?`<button class="button button-dark" data-add="${safe(p.id)}">Add to bag →</button>`:'<button class="button button-dark" disabled>Price unavailable</button>'}<button class="button" style="background:#eee4d8;color:#4d1727" data-close-modal>Continue browsing</button></div></div></div>`;$("#productModal").classList.add("visible");document.body.style.overflow="hidden"}
function closeProduct(){$("#productModal").classList.remove("visible");document.body.style.overflow=""}
function openCheckout(){if(!cart.length){openCart();return}closeCart();$("#confirmation").hidden=true;$("#checkoutForm").hidden=false;const subtotal=cartSubtotal();$("#checkoutSummary").innerHTML=`<strong>Order summary</strong><br>${cart.map(x=>{const p=products.find(y=>y.id===x.id);return `${x.qty} × ${safe(p.name)} (${safe(p.id)}) — ${money(p.price)} each · ${money(p.price*x.qty)}`}).join("<br>")}<br><strong>Subtotal and grand total: ${money(subtotal)}</strong>`;$("#checkoutModal").classList.add("visible");document.body.style.overflow="hidden"}
function closeCheckout(){$("#checkoutModal").classList.remove("visible");document.body.style.overflow=""}
document.addEventListener("click",e=>{
 const add=e.target.closest("[data-add]");if(add){const id=add.dataset.add;closeProduct();addToCart(id);return}
 const view=e.target.closest("[data-view]");if(view){openProduct(view.dataset.view);return}
 const qty=e.target.closest("[data-qty]");if(qty){const x=cart.find(y=>y.id===qty.dataset.qty);if(x){x.qty+=Number(qty.dataset.delta);if(x.qty<=0)cart=cart.filter(y=>y.id!==x.id);updateCart()}return}
 const rem=e.target.closest("[data-remove]");if(rem){cart=cart.filter(x=>x.id!==rem.dataset.remove);updateCart();return}
 if(e.target.closest("[data-close-modal]")){closeProduct();return}
 if(e.target.closest("[data-close-checkout]")){closeCheckout();return}
 if(e.target.closest("#cartContinue")){closeCart();$("#shop").scrollIntoView({behavior:"smooth"});return}
});
["searchInput","colorFilter","occasionFilter","sortSelect"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",renderProducts));
function clearFilters(){ $("#searchInput").value="";$("#colorFilter").value="";$("#occasionFilter").value="";$("#sortSelect").value="featured";renderProducts()}
$("#clearFilters").addEventListener("click",clearFilters);$("#emptyClear").addEventListener("click",clearFilters);
$("#openCart").addEventListener("click",openCart);$("#closeCart").addEventListener("click",closeCart);$("#overlay").addEventListener("click",closeCart);
$("#checkoutButton").addEventListener("click",openCheckout);
$("#productModal").addEventListener("click",e=>{if(e.target===$("#productModal"))closeProduct()});
$("#checkoutModal").addEventListener("click",e=>{if(e.target===$("#checkoutModal"))closeCheckout()});
$("#mobileFilter").addEventListener("click",()=>{$("#filters").classList.toggle("mobile-open");$("#filters").scrollIntoView({behavior:"smooth",block:"nearest"})});
$("#menuToggle").addEventListener("click",()=>{$("#filters").classList.toggle("mobile-open");$("#shop").scrollIntoView({behavior:"smooth"})});
$("#checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();
 const data=Object.fromEntries(new FormData(e.currentTarget).entries());
 const ref="THA-"+Date.now().toString(36).toUpperCase().slice(-6);
 const subtotal=cartSubtotal();
 const items=cart.map(x=>{
  const p=products.find(y=>y.id===x.id);
  return `${x.qty} × ${safe(p.name)} (${safe(p.id)}) — ${money(p.price)} each · ${money(p.price*x.qty)}`;
 }).join("\n");
 const message=["Hello Tharinayambyaisha, I would like to enquire about these sarees.",`Reference: ${ref}`,"",
  `Name: ${data.name || "Not provided"}`,
  `Phone: ${data.phone || "Not provided"}`,
  `Email: ${data.email || "Not provided"}`,
  `City: ${data.city || "Not provided"}`,
  `State: ${data.state || "Not provided"}`,
  `PIN: ${data.pin || "Not provided"}`,
  `Delivery address: ${data.address || "Not provided"}`,
  "",
  "Selected sarees:",items,
  "",
  `Subtotal: ${money(subtotal)}`,
  `Grand total: ${money(subtotal)}`
 ].join("\n");
 const whatsappUrl=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
 window.open(whatsappUrl,"_blank","noopener,noreferrer");
 $("#checkoutForm").hidden=true;
 $("#confirmation").hidden=false;
 $("#confirmation").innerHTML=`<h3>Enquiry summary created</h3><p><strong>Reference:</strong> ${safe(ref)}</p><p>Thank you, ${safe(data.name)}. Your enquiry summary is ready and has been prepared for WhatsApp delivery.</p><p><strong>Contact:</strong> ${safe(data.phone)}${data.email?" · "+safe(data.email):""}</p><p><strong>Delivery city:</strong> ${safe(data.city)}</p><p><strong>Selected sarees:</strong><br>${cart.map(x=>{const p=products.find(y=>y.id===x.id);return `${x.qty} × ${safe(p.name)} (${safe(p.id)}) — ${money(p.price*x.qty)}`}).join("<br>")}</p><p><strong>Subtotal:</strong> ${money(subtotal)}</p><p><strong>Grand total:</strong> ${money(subtotal)}</p><button class="button button-dark" id="finishEnquiry">Return to collection →</button>`;
 cart=[];
 updateCart();
 $("#confirmation").scrollIntoView({behavior:"smooth",block:"nearest"});
});
$("#confirmation").addEventListener("click",e=>{if(e.target.closest("#finishEnquiry")){closeCheckout();clearFilters();$("#shop").scrollIntoView({behavior:"smooth"})}});
window.addEventListener("storage",event=>{
 if(event.key!==window.catalogStorageKey||!event.newValue)return;
 const updatedProducts=JSON.parse(event.newValue);
 if(!Array.isArray(updatedProducts)){
  console.error("The updated product catalogue is not valid.");
  return;
 }
 products=updatedProducts;
 window.SAREES=products;
 cart=cart.filter(item=>products.some(product=>product.id===item.id&&!product.sold&&hasPrice(product)));
 renderOptions();
 renderProducts();
 updateCart();
 if(activeProduct)openProduct(activeProduct.id);
});
$("#year").textContent=new Date().getFullYear();
renderOptions();renderProducts();updateCart();