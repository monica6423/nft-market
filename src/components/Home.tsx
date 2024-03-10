import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrail, a } from '@react-spring/web';
import styles from './styles.module.css';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  open: boolean;
}

const Trail: React.FC<Props> = ({ open, children }) => {
  const items = React.Children.toArray(children)
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200, duration:400 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 110 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })
  return (
    <div>
      {trail.map(({ height, ...style }, index) => (
        <a.div key={index} className={styles.trailsText} style={style}>
          <a.div style={{ height }}>{items[index]}</a.div>
        </a.div>
      ))}
    </div>
  )
}


const Home = () => {
  const [open, set] = useState(true)
  return (
    <div className={`p-5 mb-4 ${styles.main}`}>
      <div className="container py-5">
        <h1 className="display-5 fw-bold">NFT Market</h1>
        <Trail open={open}>
          <span>Make Marvellous Art</span>
          <span>with the best</span>
          <span>NFT creator</span>
        </Trail>
        <p className="col-md-8 fs-4 mb-2">Peer-to-peer NFT trading and minting.</p>
        
        <motion.div
          className={styles.box}
          initial={{ scale: 0 }}
          animate={{  scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <Link to="/items" className={`btn btn-outline-secondary ${styles.button}`}>
             Browse NFTs
          </Link>
        </motion.div>
  
        <motion.div
          className={styles.transparent}
          initial={{ scale: 0 }}
          animate={{  scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <Link to="/mint" className={`btn btn-outline-secondary ${styles.mainButton}`}>
            Mint NFTs
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
