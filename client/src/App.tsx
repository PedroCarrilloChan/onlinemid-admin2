// client/src/App.tsx

import React, { useState, useEffect } from 'react';
import './index.css'; // Mantenemos los estilos base

// Definimos cómo se verá un objeto de tipo Usuario en nuestro frontend
interface User {
  id: string;
  email: string;
  createdAt: string;
  nombre?: string; // Campos esperados de la API original
  email_contacto?: string;
  fecha_creacion?: string;
}

function App() {
  // Estado para guardar la lista de clientes que recibamos de la API
  const [customers, setCustomers] = useState<User[]>([]);
  // Estado para manejar mensajes de carga o error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect se ejecuta una vez cuando el componente se carga
  useEffect(() => {
    // Función para ir a buscar los datos a nuestra nueva API
    const fetchCustomers = async () => {
      try {
        // Use correct API endpoint for Cloudflare Pages
        const apiUrl = '/api/customers';

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Para debug
        setCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Fallback data
        setCustomers([
          { id: '1', name: 'Juan Pérez', email: 'juan@email.com', status: 'active' },
          { id: '2', name: 'María García', email: 'maria@email.com', status: 'inactive' },
          { id: '3', name: 'Carlos López', email: 'carlos@email.com', status: 'active' }
        ]);
      } finally {
        setLoading(false); // Dejamos de cargar, ya sea con éxito o con error
      }
    };

    fetchCustomers();
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez

  // Lógica para mostrar mensajes mientras se cargan los datos
  if (loading) {
    return <div className="p-8">Cargando clientes...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  // Una vez cargados los datos, mostramos la tabla
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador - Clientes</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">ID</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Nombre</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{customer.id}</td>
                <td className="py-3 px-4">{customer.nombre}</td>
                <td className="py-3 px-4">{customer.email_contacto}</td>
                <td className="py-3 px-4">{customer.fecha_creacion ? new Date(customer.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;