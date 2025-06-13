import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "Product Management",
    items: [
      {
        title: "Category",
        icon: Icons.CategoryIcon,
        url: "/category",
        items: [],
      },
      {
        title: "Subcategory",
        url: "/sub-category",
        icon: Icons.SubCategoryIcon,
        items: [],
      },
      {
        title: "Subcategory type",
        url: "/sub-category-type",
        icon: Icons.SubItemsIcon,
        items: [],
      },
      {
        title: "Brand",
        url: "/brand",
        icon: Icons.BrandIcon,
        items: [],
      },
      {
        title: "Product",
        url: "/product",
        icon: Icons.ProductIcon,
        items: [],
      },
      {
        title: "Shop by category",
        url: "/shop-by-category",
        icon: Icons.ShopByCategoryIcon,
        items: [],
      },
      {
        title: "Specification",
        url: "/product/product-specification-key",
        icon: Icons.ProductIcon,
        items: [],
      },
      {
        title: "Additional Detail",
        url: "/product/product-detail-key",
        icon: Icons.ProductIcon,
        items: [],
      },
    ],
  },
  {
    label: "Orders",
    items: [
      {
        title: "Orders",
        url: "/orders",
        icon: Icons.OrdersIcon,
        items: [],
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "Gender",
        url: "/gender",
        icon: Icons.GenderIcon,
        items: [],
      },
      {
        title: "Users",
        url: "/users",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Ratings",
        url: "/rating",
        icon: Icons.StarIcon,
        items: [],
      },
      {
        title: "Wishlist",
        url: "/wishlist",
        icon: Icons.WishListIcon,
        items: [],
      },
    ],
  },
  {
    label: "Cart",
    items: [
      {
        title: "Cart Added Products",
        icon: Icons.CartIcon,
        url: "/cart-added-items",
        items: [],
      },
    ],
  },
  {
    label: "Offers",
    items: [
      {
        title: "Coupon",
        url: "/coupon",
        icon: Icons.DiscountIcon,
        items: [],
      },
    ],
  },
  {
    label: "Policy",
    items: [
      {
        title: "Terms & Conditions",
        url: "/terms",
        icon: Icons.TermsIcon,
        items: [],
      },
      {
        title: "Privacy Policy",
        url: "/privacy",
        icon: Icons.PrivacyIcon,
        items: [],
      },
    ],
  },
];
