// client/src/App.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import './index.css';

// Interface que coincide con la tabla "Clientes"
interface Cliente {
  id: string;
  nombre: string;
  email_contacto: string;
  fecha_creacion: string;
}

function App() {
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el nuevo formulario
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState('');

  // Función para recargar la lista de clientes
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`Error al cargar: ${response.statusText}`);
      }
      const data: Cliente[] = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError('No se pudieron cargar los clientes. Revisa la consola del navegador y los logs de Cloudflare.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newNombre || !newEmail) {
      setFormError('Ambos campos son obligatorios.');
      return;
    }
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newNombre, email_contacto: newEmail }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al crear el cliente');

      // Limpiar formulario y recargar la lista de clientes
      setNewNombre('');
      setNewEmail('');
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Función para eliminar
  const handleDelete = async (customerId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('No se pudo eliminar el cliente.');
      setCustomers(customers.filter(c => c.id !== customerId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>

      {/* Formulario para Crear Cliente */}
      <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
            />
            <input
              type="email"
              placeholder="Email de contacto"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Crear Cliente
            </button>
          </div>
          {formError && <p className="text-red-400 mt-2">{formError}</p>}
        </form>
      </div>

      {/* Tabla de Clientes */}
      <h2 className="text-2xl font-semibold mb-4">Clientes Existentes</h2>
      {loading ? <p>Cargando clientes...</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">ID</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Nombre</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Fecha de Registro</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {customers.length > 0 ? customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4">{customer.id}</td>
                  <td className="py-3 px-4">{customer.nombre}</td>
                  <td className="py-3 px-4">{customer.email_contacto}</td>
                  <td className="py-3 px-4">{new Date(customer.fecha_creacion).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleDelete(customer.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                      Eliminar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;