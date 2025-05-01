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
