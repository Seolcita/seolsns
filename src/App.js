/** @format */

import React, { useState, useEffect } from 'react';
// import { Switch, Route } from 'react-router-dom';
import db, { auth, provider } from './firebase';
import { useStateValue } from './StateProvider';
import { actionTypes } from './reducer';
import ImageUpload from './components/ImageUpload';

//Images
import logo from './images/logo.png';
import Post from './components/Post';
import testImg from './images/test.jpeg';
import avatar from './images/SeolHiKim.jpeg';

// CSS & MUI icons/components
import './App.scss';
import { Modal, Input } from '@material-ui/core';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [openSignup, setOpenSignup] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [{ userSNS }, dispatch] = useStateValue();
  // const [state, dispatch] = useStateValue();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (userSNS || authUser) {
        // user has logged in
        console.log('AUTH-USER', authUser);
        console.log('USER-SNS', userSNS);

        if (userSNS) {
          setUser(userSNS);
        } else if (authUser) {
          setUser(authUser);
        }
      } else {
        // user has logged out
        setUser(null);
      }
    });

    return () => {
      // perform some cleanup actions
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    //onSnapshot is a great listener. Whenever changes happen in db, it will capture it.
    db.collection('posts').onSnapshot((snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          post: doc.data(),
        }))
      );
    });
  }, []);

  const signUp = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({ displayName: username });
      })
      .catch((err) => alert(err.message));

    setOpenSignup(false);
    setOpenSignIn(false);
  };

  const signIn = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((err) => alert(err.message));

    setOpenSignIn(false);
  };

  const signInGoogle = (e) => {
    e.preventDefault();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        console.log('GOOGLE', result);
        dispatch({
          type: actionTypes.SET_USER,
          userSNS: result.user,
        });
      })
      .catch((error) => {
        alert(error.message);
        console.log(error.message);
      });
    setOpenSignIn(false);
  };

  return (
    <div className="app">
      {/* Sign Up */}
      <Modal
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        className="modal"
      >
        <div className="modal__container">
          <div className="modal__header">
            <img className="modal__header--logo" src={logo} alt="ogo" />
            <span className="modal__header--title">Seolstagram</span>
          </div>
          <form className="modal__form">
            <input
              className="modal__form--input"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="modal__form--input"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="modal__form--input"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="modal__form--btn" onClick={signUp}>
              Sign Up
            </button>
          </form>
        </div>
      </Modal>

      {/* Login */}
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
        className="modal"
      >
        <div className="modal__container">
          <div className="modal__header">
            <img className="modal__header--logo" src={logo} alt="ogo" />
            <span className="modal__header--title">Seolstagram</span>
          </div>
          <form className="modal__form">
            <input
              className="modal__form--input"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="modal__form--input"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="modal__form--btn" onClick={signIn}>
              Sign In
            </button>
            <hr />
            <button onClick={signInGoogle}>Sign In With Google</button>
            <span>Do you want to join Seolstagram?</span>
            <a onClick={() => setOpenSignup(true)}> Sign Up</a>
          </form>
        </div>
      </Modal>

      {/* Header */}
      <div className="app__header">
        <div className="app__header__logo">
          <img
            className="app__header__logo--img"
            src={logo}
            alt="header image"
          />
          <span className="app__header__logo--title">Seolstagram</span>
        </div>
        <div className="app__header__auth">
          <span className="app__header__auth--status">
            {user ? (
              <a onClick={() => auth.signOut()}> Logout</a>
            ) : (
              <div className="app__loginContainer">
                <a onClick={() => setOpenSignIn(true)}> Sign In</a>
                {/* <a onClick={() => setOpen(true)}> Sign Up</a> */}
              </div>
            )}
          </span>
        </div>
      </div>

      {/* Upload Post */}
      {user?.displayName ? (
        <ImageUpload username={user.displayName} userAvatar={user?.photoURL} />
      ) : (
        // <ImageUpload username={user.displayName} userImg={user.photoURL} />
        <h3 className="login-message">*** Login to upload post ***</h3>
      )}

      {/* Contents */}
      {posts.map(({ id, post }) => (
        <Post
          key={id}
          postId={id}
          user={user?.displayName}
          username={post.username}
          imageUrl={post.imageUrl}
          caption={post.caption}
          userImg={user?.photoURL}
          avatar={post.userAvatar}
          timeStamp={post.timestamp.seconds}
        />
      ))}
    </div>
  );
};

export default App;
