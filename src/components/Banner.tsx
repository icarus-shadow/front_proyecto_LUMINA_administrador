import logo from '../assets/icon.svg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { animate as anime, stagger } from 'animejs';
import ModalForm, { type FieldConfig } from './modalForm';
import RegisterEquipmentModal from './RegisterEquipmentModal';
import FormationModal from './FormationModal';
import { useAlert } from './AlertSystem';
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
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'usuario' | 'elemento' | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showAlert } = useAlert();
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
  }, [isAuthenticated]);


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
    { name: 'formacion_id', label: 'Formación', type: 'select', options: formations?.map(f => ({ value: f.id, label: `Ficha ${f.ficha} - ${f.nombre_programa} (${f.nivel_formacion?.nivel_formacion || 'Sin nivel'})` })) || [] },
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
    }
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutAsync()).unwrap();

      // Mostrar alerta según el resultado
      if (result.message) {
        if (result.message.includes('inválido') || result.message.includes('expirado')) {
          showAlert('error', '⚠️ ' + result.message);
        } else if (result.error) {
          showAlert('error', '⚠️ ' + result.message);
        }
      }

      // Navegar al login
      navigate('/login');
    } catch (error) {
      // Incluso si hay error, cerramos sesión localmente
      console.error('Error en logout:', error);
      showAlert('error', '⚠️ Error al cerrar sesión. Sesión cerrada localmente.');
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
          headerActions={modalType === 'usuario' ? (
            <button
              onClick={() => setIsFormationModalOpen(true)}
              style={{
                padding: '10px 15px',
                backgroundColor: 'var(--primary)',
                color: 'var(--text)',
                borderRadius: '5px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Gestionar Formaciones
            </button>
          ) : undefined}
          rightAdditionalContent={modalType === 'usuario' ? (formData) => {
            const selectedId = formData.formacion_id;
            const selectedFormation = formations ? formations.find(f => f.id === selectedId) : null;
            return selectedFormation ? (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: '5px' }}>
                <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Información de la Formación</h4>
                <p>ficha: {selectedFormation.ficha}</p>
                <p>nombre: {selectedFormation.nombre_programa}</p>
                <p>Nivel: {selectedFormation.nivel_formacion?.nivel_formacion || 'No disponible'}</p>
                <p>inicio: {new Date(selectedFormation.fecha_inicio_programa).toLocaleDateString('es-ES')}</p>
                <p>fin: {new Date(selectedFormation.fecha_fin_programa).toLocaleDateString('es-ES')}</p>
              </div>
            ) : null;
          } : undefined}
        />
        <RegisterEquipmentModal
          visible={showEquipmentModal}
          onHide={() => setShowEquipmentModal(false)}
        />
        <FormationModal
          isOpen={isFormationModalOpen}
          onClose={() => setIsFormationModalOpen(false)}
        />

      </div>
      {isAuthenticated && (
        <div ref={buttonsRef} style={{ display: 'flex', gap: '20px', marginLeft: '50px' }}>
          <button
            onClick={() => handleButtonClick('usuario', '/usuarios')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--secondary-rgb), 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--primary-rgb), 0.3)';
            }}
            style={{
              marginLeft: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'var(--text)',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              height: '70px',
              boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0,
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Agregar Usuario</span>
          </button>
          <button
            onClick={() => handleButtonClick('elemento', '/elementos')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--secondary-rgb), 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--primary-rgb), 0.3)';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'var(--text)',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              height: '70px',
              boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0,
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Agregar Elemento</span>
          </button>
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(var(--accent-rgb), 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(var(--error-color), 0.3)';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--error-color), var(--accent))',
              color: 'var(--text)',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              height: '70px',
              boxShadow: '0 4px 15px rgba(201, 122, 122, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0,
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner