import React, { useState, useEffect, FormEvent } from 'react';
import './index.css';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

function App() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`Error al cargar: ${response.statusText}`);
      }
      const data: User[] = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError('No se pudieron cargar los clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newEmail || !newPassword) {
      setFormError('Ambos campos son obligatorios.');
      return;
    }
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al crear');

      setNewEmail('');
      setNewPassword('');
      fetchCustomers(); // Recargar la lista para ver el nuevo cliente
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async (customerId: string) => {
    // Pedimos confirmación para evitar borrados accidentales
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el cliente.');
      }

      // Si se elimina con éxito, actualizamos la lista en el frontend
      // sin necesidad de volver a llamar a la API.
      setCustomers(customers.filter(customer => customer.id !== customerId));

    } catch (err: any) {
      setError(err.message);
    }
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              placeholder="Email del cliente"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Crear Cliente
            </button>
          </div>
          {formError && <p className="text-red-400 mt-2">{formError}</p>}
        </form>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Clientes Existentes</h2>
      {loading ? <p>Cargando clientes...</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">ID</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Fecha de Registro</th>
                {/* Nueva columna */}
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {customers.length > 0 ? customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4">{customer.id}</td>
                  <td className="py-3 px-4">{customer.email}</td>
                  <td className="py-3 px-4">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  {/* Nuevo botón de eliminar */}
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
                  <td colSpan={4} className="text-center py-4">No se encontraron clientes.</td>
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