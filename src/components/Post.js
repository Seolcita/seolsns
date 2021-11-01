/** @format */

import React, { useState, useEffect } from 'react';
import db from '../firebase';
import firebase from 'firebase';

// CSS & MUI-Icon/Components
import './Post.scss';
import { Avatar } from '@material-ui/core';
import userIcon from '../images/user.png';

function Post(props) {
  const { imageUrl, avatar, user, username, postId, caption, userImg } = props;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let unsubscribe;
    // console.log(postId);

    unsubscribe = db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setComments(snapshot.docs.map((doc) => doc.data()));
      });

    console.log('comments from DB', comments);

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('POST ID *****', postId);
    console.log('text comment just insert ********', comment);
    console.log('writer name *********', user);

    if (postId) {
      db.collection('posts').doc(postId).collection('comments').add({
        text: comment,
        writer: user,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userImg: userImg,
      });
      setComment('');
    }
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__header--avatar"
          alt="User Avatar"
          src={avatar}
        />
        <h3 className="post__header--name">{username}</h3>
      </div>

      <div className="post__body">
        <img className="post__body--img" src={imageUrl} alt="Post Image" />
      </div>

      <div className="post__footer">
        <h4 className="post__footer--text">{caption}</h4>
        <div className="post__comments">
          <p className="post__comments--title">Comments 💕</p>
          {comments.map((cmt) => (
            <p className="post__comments--wrap">
              {console.log('CMT USER IMAGAE', cmt.userImg)}
              <img
                src={cmt.userImg ? cmt.userImg : userIcon}
                alt=""
                className="post__comments--userImg"
              />
              <strong>{cmt.writer}</strong>
              <span className="post__comments--span">{cmt.text}</span>
            </p>
          ))}
        </div>
        <form className="post__comment">
          <input
            type="text"
            className="post__comment--text"
            placeholder={user ? 'Add a comment' : 'Please login to add comment'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            className="post__comment--btn"
            onClick={handleSubmit}
            disabled={!comment || !user}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default Post;
