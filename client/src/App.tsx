// client/src/App.tsx

import React, { useState, useEffect } from 'react';
import './index.css'; // Mantenemos los estilos base

// Definimos cómo se verá un objeto de tipo Usuario en nuestro frontend
interface User {
  id: string;
  email: string;
  createdAt: string;
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
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue exitosa');
        }
        const data: User[] = await response.json();
        setCustomers(data); // Guardamos los datos en el estado
      } catch (err) {
        setError('No se pudieron cargar los clientes.');
        console.error(err);
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
                <td className="py-3 px-4">{new Date(customer.fecha_creacion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;