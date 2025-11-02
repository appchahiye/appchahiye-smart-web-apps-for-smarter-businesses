import type { DemoData, BusinessType } from './types';
const retailData: DemoData = {
  customers: [
    { id: 'cust_1', name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', since: '2023-01-15', avatarUrl: 'https://i.pravatar.cc/150?u=retail_1' },
    { id: 'cust_2', name: 'Bob Williams', email: 'bob@example.com', phone: '555-0102', since: '2023-03-22', avatarUrl: 'https://i.pravatar.cc/150?u=retail_2' },
  ],
  products: [
    { id: 'prod_1', name: 'Classic T-Shirt', price: 25.00, stock: 150 },
    { id: 'prod_2', name: 'Denim Jeans', price: 75.00, stock: 80 },
  ],
  orders: [
    { id: 'ord_1', customerId: 'cust_1', date: '2024-05-10', amount: 100.00, status: 'Completed' },
    { id: 'ord_2', customerId: 'cust_2', date: '2024-05-12', amount: 75.00, status: 'Pending' },
  ],
};
const serviceData: DemoData = {
  customers: [
    { id: 'cust_3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', since: '2022-11-01', avatarUrl: 'https://i.pravatar.cc/150?u=service_1' },
    { id: 'cust_4', name: 'Diana Miller', email: 'diana@example.com', phone: '555-0104', since: '2023-02-10', avatarUrl: 'https://i.pravatar.cc/150?u=service_2' },
  ],
  products: [ // Using 'products' to represent services
    { id: 'serv_1', name: 'Web Design Package', price: 1500.00, stock: 999 }, // stock can mean availability
    { id: 'serv_2', name: 'Monthly SEO', price: 500.00, stock: 999 },
  ],
  orders: [ // Using 'orders' to represent projects/invoices
    { id: 'proj_1', customerId: 'cust_3', date: '2024-04-20', amount: 1500.00, status: 'Completed' },
    { id: 'proj_2', customerId: 'cust_4', date: '2024-05-01', amount: 500.00, status: 'Pending' },
  ],
};
const clinicData: DemoData = {
  customers: [ // Using 'customers' to represent patients
    { id: 'pat_1', name: 'Ethan Davis', email: 'ethan@example.com', phone: '555-0105', since: '2023-06-18', avatarUrl: 'https://i.pravatar.cc/150?u=clinic_1' },
    { id: 'pat_2', name: 'Fiona Garcia', email: 'fiona@example.com', phone: '555-0106', since: '2024-01-05', avatarUrl: 'https://i.pravatar.cc/150?u=clinic_2' },
  ],
  products: [ // Using 'products' to represent treatments
    { id: 'treat_1', name: 'Dental Check-up', price: 100.00, stock: 999 },
    { id: 'treat_2', name: 'Physical Therapy Session', price: 150.00, stock: 999 },
  ],
  orders: [ // Using 'orders' to represent appointments
    { id: 'appt_1', customerId: 'pat_1', date: '2024-05-15', amount: 100.00, status: 'Completed' },
    { id: 'appt_2', customerId: 'pat_2', date: '2024-05-20', amount: 150.00, status: 'Pending' },
  ],
};
export const mockDemoData: Record<BusinessType, DemoData> = {
  Retail: retailData,
  Service: serviceData,
  Clinic: clinicData,
};