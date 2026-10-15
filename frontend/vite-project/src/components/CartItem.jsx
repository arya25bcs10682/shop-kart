import { useCart } from '../context/cartContextDefinition';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionInProgress } = useCart();

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const { _id, name, price, category, image, stock } = product;

  const isUpdating = Boolean(actionInProgress[_id]);

  const formattedUnitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const formattedItemTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price * quantity);

  const handleDecrease = async () => {
    if (isUpdating) return;
    if (quantity > 1) {
      await updateQuantity(_id, quantity - 1);
    }
  };

  const handleIncrease = async () => {
    if (isUpdating) return;
    if (quantity < stock) {
      await updateQuantity(_id, quantity + 1);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    await removeFromCart(_id);
  };

  return (
    <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 shadow-inner flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-0.5 block">
            {category}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-stone-600">
              {formattedUnitPrice} each
            </span>
            {stock <= 5 && stock > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Only {stock} left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls & Total */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
        {/* Quantity Controls [-] qty [+] */}
        <div className="flex items-center gap-2">
          <div className="flex items-center clay-card-sm px-1 py-0.5 bg-stone-50">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={isUpdating || quantity <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-extrabold text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={isUpdating || quantity >= stock}
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-stone-700 hover:bg-stone-200/60 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Remove from cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-[80px]">
          <span className="text-sm sm:text-base font-extrabold text-stone-900 block">
            {formattedItemTotal}
          </span>
        </div>
      </div>
    </div>
  );
}