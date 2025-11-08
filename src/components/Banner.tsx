import logo from '../assets/icon.svg';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <Link to="/" style={{
      width: '100%',
      height: '80px',
      background: 'linear-gradient(to right, var(--primary) 1%, transparent 30%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0 20px',
        borderRadius: '10px',
      boxSizing: 'border-box',
      textDecoration: 'none',
    }}>
      <img src={logo} alt="Lumina Logo" style={{ height: '60px', marginRight: '20px' }} />
      <span style={{ color: 'var(--text)', fontSize: '36px', fontWeight: 'bold' }}>lumina</span>
    </Link>
  );
};

export default Banner