/**
 * ============================================================
 *  cart.js  —  Cart Logic and State Management
 * ============================================================
 *  Encapsulates operations on the client shopping cart state.
 *  Uses the database products array fetched from the backend.
 * ============================================================
 */

export function createCartActions(cart, setCart, allProducts) {
  /**
   * addToCart(productId, quantity, variation)
   * Adds a product to cart (or increments qty if already in it).
   * Uses String() coercion so it works with both numeric mock IDs
   * and MongoDB ObjectId strings from the live backend.
   */
  const addToCart = (productId, quantity = 1, variation = '') => {
    // Compare as strings to handle both numeric and ObjectId formats
    const product = allProducts.find((p) => String(p.id) === String(productId));
    if (!product) {
      console.warn(`[addToCart] Product #${productId} not found.`);
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => String(item.id) === String(productId) && item.variation === variation
      );
      if (existing) {
        return prevCart.map((item) =>
          String(item.id) === String(productId) && item.variation === variation
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category,
          variation,
          quantity,
        },
      ];
    });
  };

  /**
   * addToCartDirect(productId)
   * Convenience: adds 1 unit with the product's first available variation.
   * Used by product grid "Quick Add" buttons.
   */
  const addToCartDirect = (productId) => {
    // Compare as strings to handle both numeric and ObjectId formats
    const product = allProducts.find((p) => String(p.id) === String(productId));
    if (!product) return;

    let defaultVariation = '';
    if (product.variations) {
      if (product.variations.type === 'color') {
        defaultVariation = product.variations.options[0].name;
      } else {
        defaultVariation = product.variations.options[0];
      }
    }
    addToCart(productId, 1, defaultVariation);
  };

  /**
   * adjustQty(index, change)
   * Increments or decrements a cart item's quantity.
   * Removes the item when quantity reaches 0.
   */
  const adjustQty = (index, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /**
   * removeItem(index)
   * Removes a cart line-item by its array index.
   */
  const removeItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  return { addToCart, addToCartDirect, adjustQty, removeItem };
}

