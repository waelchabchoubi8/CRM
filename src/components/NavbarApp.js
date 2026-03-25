import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem, Button, Box, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSelector } from 'react-redux';
const Navbar = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openMenu, setOpenMenu] = React.useState('');
    const user = useSelector((state) => state.user);
    const handleClick = (event, menu) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(menu);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setOpenMenu('');
    };

    return (
        <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f0f0f0' }}>
            <div>
                <Button
                    aria-controls="contact-menu"
                    aria-haspopup="true"
                    onClick={(e) => handleClick(e, 'contact')}
                    endIcon={<ArrowDropDownIcon />}
                >
                    Contact
                </Button>
                <Menu
                    id="contact-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={openMenu === 'contact'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>
                        <Link to="/liste-des-clients">Liste des clients</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/planning-collaborateurs">Planning collaborateurs</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/taches-effectuees">Tâches effectuées</Link>
                    </MenuItem>
                </Menu>
                <Button
                    aria-controls="contact-menu"
                    aria-haspopup="true"
                    onClick={(e) => handleClick(e, 'contact')}
                    endIcon={<ArrowDropDownIcon />}
                >
                    Contact
                </Button>
                <Button
                    aria-controls="admin-menu"
                    aria-haspopup="true"
                    onClick={(e) => handleClick(e, 'admin')}
                    endIcon={<ArrowDropDownIcon />}
                >
                    Administration
                </Button>
                <Menu
                    id="admin-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={openMenu === 'admin'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>
                        <Link to="/gestion-des-utilisateurs">Gestion des utilisateurs</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/gestion-des-menus">Gestion des menus</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/planification-des-collaborateurs">Planification des collaborateurs</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/Status-des-parteniares">Gestion des statuts partenaires</Link>
                    </MenuItem>
                </Menu>

                <Button
                    aria-controls="marketing-menu"
                    aria-haspopup="true"
                    onClick={(e) => handleClick(e, 'marketing')}
                    endIcon={<ArrowDropDownIcon />}
                >
                    Marketing
                </Button>
                <Menu
                    id="marketing-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={openMenu === 'marketing'}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>
                        <Link to="/mailing">Mailing</Link>
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        <Link to="/lenvoi-sms">L'envoi SMS</Link>
                    </MenuItem>
                </Menu>
            </div>

            <Box display="flex" alignItems="center">
                <AccountCircleIcon style={{ marginRight: '8px' }} />
                <Typography variant="h6" component="div" color="primary">
                    {user?.ROLE}
                </Typography>
            </Box>
        </div>
    );
}

export default Navbar;
