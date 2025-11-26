import logo from '../assets/icon.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ModalForm, { type FieldConfig } from './modalForm';
import { useAppSelector } from '../services/redux/hooks';

const Banner = () => {
  const { user, token } = useAppSelector((state) => state.authReducer);
  const isAuthenticated = !!token && !!user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'usuario' | 'elemento' | null>(null);
  const navigate = useNavigate();

  const userFields: FieldConfig[] = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true },
    { name: 'tipo_documento', label: 'Tipo Documento', type: 'text', required: true },
    { name: 'documento', label: 'Documento', type: 'text', required: true },
    { name: 'edad', label: 'Edad', type: 'number', required: true },
    { name: 'numero_telefono', label: 'Número Teléfono', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ];

  const elementFields: FieldConfig[] = [
    { name: 'sn_equipo', label: 'SN Equipo', type: 'text', required: true },
    { name: 'marca', label: 'Marca', type: 'text', required: true },
    { name: 'color', label: 'Color', type: 'text', required: true },
    { name: 'tipo_elemento', label: 'Tipo Elemento', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  ];

  const handleButtonClick = (type: 'usuario' | 'elemento', path: string) => {
    setModalType(type);
    setIsModalOpen(true);
    navigate(path);
  };

  const handleModalSubmit = (data: Record<string, any>) => {
    console.log('Datos del formulario:', data);
    setIsModalOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <div style={{
        width: '700px',
        height: '110px',
        background: 'linear-gradient(to right, var(--secondary) 0%, transparent 83%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderRadius: '10px',
        boxSizing: 'border-box',
      }}>
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}>
          <img src={logo} alt="Lumina Logo" style={{ height: '80px', marginRight: '20px' }} />
          <span style={{ color: 'var(--text)', fontSize: '50px', fontWeight: 'bold' }}>LUMINA</span>
        </a>

        <ModalForm
          isOpen={isModalOpen}
          title={modalType === 'usuario' ? 'Agregar Usuario' : 'Agregar Elemento'}
          fields={modalType === 'usuario' ? userFields : elementFields}
          initialValue={{}}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />

      </div>
      {isAuthenticated && (
        <div style={{ display: 'flex', gap: '20px', marginLeft: '50px' }}>
          <button onClick={() => handleButtonClick('usuario', '/usuarios')} style={{
            marginLeft: '60px',
            padding: '10px 15px',
            backgroundColor: 'var(--primary)',
            color: 'var(--text)',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            height: '70px',
          }}>
            Agregar Nuevo Usuario
          </button>
          <button onClick={() => handleButtonClick('elemento', '/elementos')} style={{
            padding: '10px 15px',
            backgroundColor: 'var(--primary)',
            color: 'var(--text)',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            height: '70px',
          }}>
            Agregar Nuevo Elemento
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner