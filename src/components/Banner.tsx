import logo from '../assets/icon.svg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { animate as anime, stagger } from 'animejs';
import ModalForm, { type FieldConfig } from './modalForm';
import RegisterEquipmentModal from './RegisterEquipmentModal';
import { useAppSelector, useAppDispatch } from '../services/redux/hooks';
import { logoutAsync } from '../services/redux/slices/AuthSlice';
import { addUser } from '../services/redux/slices/data/UsersSlice';
import type { AddUserPayload } from '../types/interfacesData';
import type { RootState } from '../services/redux/store';

const Banner = () => {
  const { user, token } = useAppSelector((state) => state.authReducer);
  const isAuthenticated = !!token && !!user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [modalType, setModalType] = useState<'usuario' | 'elemento' | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const formations = useAppSelector((state: RootState) => state.formationsReducer.data);
  const subElements = useAppSelector((state: RootState) => state.subElementsReducer.data);

  // Refs para animaciones
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Animaciones de entrada
  useEffect(() => {
    if (logoRef.current) {
      anime(logoRef.current, {
        rotate: [0, 360],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .6)',
      });
    }
    if (titleRef.current) {
      anime(titleRef.current, {
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 200,
        easing: 'easeOutCubic',
      });
    }
    if (buttonsRef.current) {
      const buttons = buttonsRef.current.querySelectorAll('button');
      if (buttons.length > 0) {
        anime(buttons, {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 600,
          delay: stagger(100, { start: 400 }),
          easing: 'easeOutQuad',
        });
      }
    }
  }, []);


  const tiposDocumentos = [
    {
      value: 'CC',
      label: 'Cedula de Ciudadania (CC)'
    },
    {
      value: 'TI',
      label: 'Tarjeta de Identidad (TI)'
    },
    {
      value: 'RC',
      label: 'Registro Civil (RC)'
    },
    {
      value: 'CR',
      label: 'Contraseña REgistraduria'
    },
    {
      value: 'CE',
      label: 'Cedula de Extranjeria (CE)'
    },
    {
      value: 'Pasaporte',
      label: 'Pasaporte'
    },
    {
      value: 'PEP',
      label: 'Permiso Especial de Permanencia (PEP)'
    },
    {
      value: 'DIE',
      label: 'Documento de Identificación Extranjero (DIE)'
    }
  ]

  const leftFields: FieldConfig[] = [
    { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [{ value: 1, label: 'usuario' }, { value: 2, label: 'admin' }, { value: 3, label: 'portero' }] },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true },
    { name: 'tipo_documento', label: 'Tipo Documento', type: 'select', required: true, options: tiposDocumentos.map(tc => ({ value: tc.value, label: tc.label })) },
    { name: 'documento', label: 'Documento', type: 'text', required: true },
    { name: 'edad', label: 'Edad', type: 'number', required: true },
    { name: 'numero_telefono', label: 'Número Teléfono', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    { name: 'path_foto', label: 'Foto', type: 'file', required: true, },
  ];

  const rightFields: FieldConfig[] = [
    { name: 'formacion_id', label: 'Formación', type: 'select', options: formations?.map(f => ({ value: f.id, label: f.nombre_programa })) || [] },
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
    { name: 'subElements', label: 'Elementos Adicionales', type: 'multiSelect', options: subElements?.map(s => ({ value: s.id, label: s.nombre_elemento })) || [] },
  ];

  const handleButtonClick = (type: 'usuario' | 'elemento', path: string) => {
    navigate(path);
    if (type === 'elemento') {
      setShowEquipmentModal(true);
    } else {
      setModalType(type);
      setIsModalOpen(true);
    }
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

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutAsync()).unwrap();

      // Mostrar alerta según el resultado
      if (result.message) {
        if (result.message.includes('inválido') || result.message.includes('expirado')) {
          alert('⚠️ ' + result.message);
        } else if (result.error) {
          alert('⚠️ ' + result.message);
        }
      }

      // Navegar al login
      navigate('/login');
    } catch (error) {
      // Incluso si hay error, cerramos sesión localmente
      console.error('Error en logout:', error);
      alert('⚠️ Error al cerrar sesión. Sesión cerrada localmente.');
      navigate('/login');
    }
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
        <a href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}>
          <img ref={logoRef} src={logo} alt="Lumina Logo" style={{ height: '80px', marginRight: '20px', opacity: 0 }} />
          <span ref={titleRef} style={{ color: 'var(--text)', fontSize: '50px', fontWeight: 'bold', opacity: 0 }}>LUMINA</span>
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
        <RegisterEquipmentModal
          visible={showEquipmentModal}
          onHide={() => setShowEquipmentModal(false)}
        />

      </div>
      {isAuthenticated && (
        <div ref={buttonsRef} style={{ display: 'flex', gap: '20px', marginLeft: '50px' }}>
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
            opacity: 0,
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
            opacity: 0,
          }}>
            Agregar Nuevo Elemento
          </button>
          <button onClick={handleLogout} style={{
            padding: '10px 15px',
            backgroundColor: 'var(--danger, #e74c3c)',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            height: '70px',
            opacity: 0,
          }}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner