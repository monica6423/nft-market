import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrail, a } from '@react-spring/web';
import styles from './styles.module.css';
import { motion } from 'framer-motion';
import Art1 from '../assets/art_1.svg'
import Art2 from '../assets/art_2.svg'
import Art3 from '../assets/art_3.svg'

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

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const Home = () => {
  const [open, set] = useState(true)
  return (
    <div className={`px-5 pt-5 ${styles.main}`}>
      <div className={`container py-1 position-relative ${styles.heroSlogan}`}>
        <Trail open={open}>
          <span>Make Marvellous NFT Art</span>
          <span className="p-5">with the best</span>
          <span>NFT creator</span>
        </Trail>
        <p className={`col-md-6 fs-4 mb-2 ${styles.paragraph}`}>Peer-to-peer NFT trading and minting. Empower your unique digital arts with photos with crypto and become a digital artist</p>
        <motion.div
          className={styles.box}
          initial={{ scale: 0 }}
          animate={{  scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 60,
            delay: 0.4
          }}
        >
          <Link to="/items" className={`btn btn-outline-secondary ${styles.button}`}>
             Browse NFTs
          </Link>
        </motion.div>
        <motion.div
          className={`${styles.transparent}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 60,
            delay: 0.6
          }}
        >
          <Link to="/mint" className={`btn btn-outline-secondary ${styles.mainButton}`}>
            Minting NFTs
          </Link>
        </motion.div>
        <div className="container">
          <motion.ul
            className="row justify-content-end"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item} className={`card m-3 ${styles.artcard}`} style={{width: '15rem'}}>
              <img className={`card-img-top ${styles.artimage}`} src={Art1} alt="Card image cap" />
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">Some quick example .</p>
              </div>
            </motion.div>
            <motion.div variants={item} className={`card m-3 ${styles.artcard}`}  style={{width: '15rem'}}>
              <img className={`card-img-top ${styles.artimage}`} src={Art2} alt="Card image cap" />
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">Some quick example .</p>
              </div>
            </motion.div>
            <motion.div variants={item} className={`card m-3 ${styles.artcard}`}  style={{width: '15rem'}}>
              <img className={`card-img-top ${styles.artimage}`} src={Art3} alt="Card image cap" />
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">Some quick example .</p>
              </div>
            </motion.div>
          </motion.ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
