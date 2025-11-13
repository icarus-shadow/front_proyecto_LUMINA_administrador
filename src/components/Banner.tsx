import logo from '../assets/icon.svg';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <Link to="/" style={{
      width: '700px',
      height: '110px',
      background: 'linear-gradient(to right, var(--secondary) 0%, transparent 83%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0 20px',
        borderRadius: '10px',
      boxSizing: 'border-box',
      textDecoration: 'none',
    }}>
      <img src={logo} alt="Lumina Logo" style={{ height: '80px', marginRight: '20px' }} />
      <span style={{ color: 'var(--text)', fontSize: '50px', fontWeight: 'bold' }}>LUMINA</span>
    </Link>
  );
};

export default Banner