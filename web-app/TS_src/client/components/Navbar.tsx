import React from 'react';
import useStore from '../store';
import axios from 'axios';


//   const logOut = async() => {
//     setCurrUser(0, '');
//     setCurrEndPoint(0, '');
//     setIsLoggedIn(false);
//     await axios.post('/api/account/logout');
//   }

//   const handleMenu = (event: any) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#003366" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{display: "flex", alignItems: "center"}}>
          <div hidden={!currUser.email}>
            <IconButton
              onClick={handleMenu}
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{ marginTop: "2rem" }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem sx={{ fontWeight: "bold" }} >
                <span>Maybe we</span>
              </MenuItem>
              <MenuItem sx={{ fontWeight: "bold" }} >
                <span>Use this</span>
              </MenuItem>
              <MenuItem sx={{ fontWeight: "bold" }} >
                <span>Menu?</span>
              </MenuItem>
            </Menu>
          </div>
          <Typography
            variant="h5"
            sx={{ color: "#ffffff", textDecoration: "none" }}
          >
            GleiphQL
          </Typography>
        </div>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "#ffffff", textDecoration: "none" }}
          >
            {currUser.email === "" ? "" : `WELCOME, ${currUser.email.split("@")[0].toUpperCase()}`}
          </Typography>
          { isLoggedIn? 
          <Button
          onClick={logOut}
          sx={{
            backgroundColor: "#ffffff",
            color: "#003366",
            textDecoration: "none",
            marginLeft: "25px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#003366", color: "#FFFFFF" },
          }}
        >
          LOGOUT
          </Button>: 
          <Button
          onClick={()=>loginToggle(true)}
          sx={{
            backgroundColor: "#ffffff",
            color: "#003366",
            textDecoration: "none",
            marginLeft: "25px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#003366", color: "#FFFFFF" },
          }}
        >
          LOGIN
        </Button>
      }
      </Box>
      </Toolbar>
    </AppBar>
  )
};

// export default Navbar;