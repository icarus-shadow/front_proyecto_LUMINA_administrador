import logo from '../assets/icon.svg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModalForm, { type FieldConfig } from './modalForm';
import { useAppSelector, useAppDispatch } from '../services/redux/hooks';
import { fetchFormations } from '../services/redux/slices/data/formationSlice';
import { addUser } from '../services/redux/slices/data/UsersSlice';
import { fetchSubElements } from '../services/redux/slices/data/subElementsSlice';
import type { AddUserPayload } from '../types/interfacesData';
import type { RootState } from '../services/redux/store';

const Banner = () => {
  const { user, token } = useAppSelector((state) => state.authReducer);
  const isAuthenticated = !!token && !!user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'usuario' | 'elemento' | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const formations = useAppSelector((state: RootState) => state.formationsReducer.data);
  const subElements = useAppSelector((state: RootState) => state.subElementsReducer.data);

  useEffect(() => {
    if (formations && formations.length === 0) {
      dispatch(fetchFormations());
    }
    if (subElements && subElements.length === 0) {
      dispatch(fetchSubElements());
    }
  }, [dispatch, formations?.length, subElements?.length]);

  const leftFields: FieldConfig[] = [
    { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [{value:1, label:'usuario'}, {value:2, label:'admin'}, {value:3, label:'portero'}] },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true },
    { name: 'tipo_documento', label: 'Tipo Documento', type: 'text', required: true },
    { name: 'documento', label: 'Documento', type: 'text', required: true },
    { name: 'edad', label: 'Edad', type: 'number', required: true },
    { name: 'numero_telefono', label: 'Número Teléfono', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'text', required: true },
    { name: 'path_foto', label: 'Foto', type: 'file', accept: 'image/*' },
  ];

  const rightFields: FieldConfig[] = [
    { name: 'formacion_id', label: 'Formación', type: 'select', options: formations?.map(f => ({value: f.id, label: f.nombre_programa})) || [] },
  ];

  const leftTitle = 'Información del Usuario';
  const rightTitle = 'Formación';
  const bannerMessage = formations?.length === 0 ? 'No hay formaciones disponibles' : undefined;

  const elementFields: FieldConfig[] = [
    { name: 'sn_equipo', label: 'SN Equipo', type: 'text', required: true },
    { name: 'marca', label: 'Marca', type: 'text', required: true },
    { name: 'color', label: 'Color', type: 'text', required: true },
    { name: 'tipo_elemento', label: 'Tipo Elemento', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
  ];

  const elementRightFields: FieldConfig[] = [
    { name: 'subElements', label: 'Elementos Adicionales', type: 'multiSelect', options: subElements?.map(s => ({value: s.id, label: s.nombre_elemento})) || [] },
  ];

  const handleButtonClick = (type: 'usuario' | 'elemento', path: string) => {
    setModalType(type);
    setIsModalOpen(true);
    navigate(path);
  };

  const handleModalSubmit = (data: Record<string, any>) => {
    if (modalType === 'usuario') {
      const payload: AddUserPayload = {
        role_id: data.role_id,
        formacion_id: data.formacion_id || null,
        nombre: data.nombre,
        apellido: data.apellido,
        tipo_documento: data.tipo_documento,
        documento: data.documento,
        edad: data.edad,
        numero_telefono: data.numero_telefono,
        email: data.email,
        password: data.password,
        path_foto: data.path_foto,
      };
      dispatch(addUser(payload));
    } else {
      console.log('Datos del formulario:', data);
    }
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
          leftFields={modalType === 'usuario' ? leftFields : elementFields}
          rightFields={modalType === 'usuario' ? rightFields : elementRightFields}
          leftTitle={modalType === 'usuario' ? leftTitle : 'Información del Elemento'}
          rightTitle={modalType === 'usuario' ? rightTitle : 'Elementos Adicionales'}
          bannerMessage={modalType === 'usuario' ? bannerMessage : undefined}
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