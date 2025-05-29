export interface ICategory {
  id: number;
  name: string;
  description: string;
  create_at: string;
  updated_at: string;
}
export interface IPaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface ICategoryApiResponse {
  data: { data: { items: ICategory[]; meta: IPaginationData } };
  status: number;
}

export type SortOrder = "asc" | "desc";

export interface ISubCategory {
  id: number;
  name: string;
  description: string;
  create_at: string;
  updated_at: string;
  category_id: string;
  category: {
    id: string;
    name: string;
  };
}

export interface ISubCategoryApiResponse {
  data: { data: { items: ISubCategory[]; meta: IPaginationData } };
  status: number;
}

export interface IGetAllCategoriesResponse {
  data: { data: ICategory[] };
  status: number;
}

export interface IBrand {
  id: number;
  name: string;
  description: string;
  create_at: string;
  updated_at: string;
}
export interface IBrandApiResponse {
  data: { data: { items: IBrand[]; meta: IPaginationData } };
  status: number;
}

export interface ISubCategoryType {
  id: number;
  name: string;
  description: string;
  create_at: string;
  updated_at: string;
  category_id: string;
  category: {
    id: string;
    name: string;
  };
  sub_category: {
    id: string;
    name: string;
  };
}

export interface ISubCategoryTypeApiResponse {
  data: { data: { items: ISubCategoryType[]; meta: IPaginationData } };
  status: number;
}
export interface UserAttr {
  first_name: string | null;
  last_name: string | null;
  email: string;
  mobile: string | null;
  birth_date: string | null;
  gender_id: number | null;
  profile_url: string | null;
}

export interface UserProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  birth_date: string;
  gender_id: string;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  token?: string;
}

export interface IGetAllSubCategoriesType {
  data: { data: { items: ISubCategoryType[]; meta: IPaginationData } };
  status: number;
}

export interface IProduct {
  size_quantities: {
    id: number;
    quantity: number;
    discount: number;
    price: number;
    size_data: {
      name: string;
      id: number;
      size: string;
    };
  }[];
  id: number;
  name: string;
  description: string;
  image: string[];
  price: string;
  discount: number;
  quantity: number;
  category_id: number;
  sub_category_id: number;
  sub_category_type_id: number;
  brand_id: number;
  create_at: string;
  updated_at: string;
  is_deleted: boolean;
  category: ICategory;
  sub_category: ISubCategory;
  sub_category_type: ISubCategoryType;
  brand: IBrand;
  variant_id: string;
  relatedProducts: IProduct[];
  custom_product_id: string;
}

export interface IProductApiResponse {
  data: { data: { items: IProduct[]; meta: IPaginationData } };
  status: number;
}

export interface IGender {
  id: number;
  name: string;
  create_at: string;
  updated_at: string;
}
export interface IGenderApiResponse {
  data: { data: { items: IGender[]; meta: IPaginationData } };
  status: number;
}

export interface IRole {
  id: number;
  name: string;
}

export interface IUserGender {
  id: number;
  name: string;
}

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  profile_url: string;
  email: string;
  role_id: number;
  mobile: string;
  gender_id: number;
  birth_date: string; // you can change to `Date` if it's parsed
  otp: string | null;
  otp_verified: boolean;
  create_at: string; // or Date
  updated_at: string; // or Date
  is_deleted: boolean;
  role: IRole;
  gender: IUserGender;
  is_approved: boolean;
  is_active?: boolean;
}
export interface IUserApiResponse {
  data: { data: { items: IUser[]; meta: IPaginationData } };
  status: number;
}

export interface IReview {
  id: number;
  user_id: number;
  product_id: number;
  ratings: number;
  images: string[];
  description: string;
  create_at: string;
  updated_at: string;
  is_deleted: boolean;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_url: string;
  };
  products: {
    id: number;
    name: string;
    image: string[];
  };
}
export interface IReviewApiResponse {
  data: { data: { items: IReview[]; meta: IPaginationData } };
  status: number;
}

export interface ICoupon {
  id: number;
  code: string;
  description?: string;
  discount: number;
  max_savings_amount: number;
  min_order_amount: number;
  expiry_date: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICouponApiResponse {
  status: number;
  data: {
    data: {
      items: ICoupon[];
      meta: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
      };
    };
  };
}

export interface ISize {
  id: number;
  name: string;
  size: string;
}

export interface ISizeApiResponse {
  data: ISize[];
  status: number;
}

// -------------------------------------wishlist------------------------------------------

interface IWishlistUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}
export interface IWishlist {
  product: {
    id: number;
    name: string;
    price: string;
    discount: number;
    image: string[];
    category: ICategory;
    sub_category: ISubCategory;
    sub_category_type: ISubCategoryType;
    brand: IBrand;
  };
  unique_users_count: number;
  users: IWishlistUser[];
}

export interface IWishlistResponse {
  data: { data: { items: IWishlist[]; meta: IPaginationData } };
  status: number;
}

export interface IWishlistTableAttr {
  id: number;
  name: string;
  productImage: string[];
  price: string;
  discount: number;
  brand: string;
  category: string;
  sub_category: string;
  sub_category_type: string;
  users: number;
}

// ----------------------------------Shop By Category--------------------------------

export interface ICardStyleResponse {
  data: {
    status: number;
    data: {
      id: number;
      cardColor: string;
      fontColor: string;
      updatedAt: string;
    };
  };
}

export interface IShopByCategory {
  id: number;
  name: string;
  image: string;
  user_id: number;
  minDiscount: number;
  maxDiscount: number;
  sub_category_id: number;
  create_at: string;
  updated_at: string;
  sub_category: ISubCategory;
}

export interface IShopByCategoryResponse {
  data: { data: { items: IShopByCategory[]; meta: IPaginationData } };
  status: number;
}

export interface IShopByCategoryIdResponse {
  data: { data: IShopByCategory; meta: IPaginationData };
  status: number;
}

export interface IGetAllSubCategoriesResponse {
  data: { data: ISubCategory[] };
  status: number;
}

export interface IOtpExpiryLimitResponse {
  data: { data: { otp_limit_expires_at: string; message: string } };
  status: number;
}

export interface IResendOtpExpiryLimitResponse {
  data: { data: { resend_otp_limit_expires_at: string } };
  status: number;
}
