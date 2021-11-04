/** @format */

import React, { useState, useEffect } from 'react';
import db from '../firebase';
import firebase from 'firebase';
import PostUpdate from './PostUpdate';

// CSS & MUI-Icon/Components
import './Post.scss';
import { Avatar } from '@material-ui/core';
import userIcon from '../images/user.png';
import { Modal } from '@material-ui/core';
import { Edit, DeleteForever, RateReview } from '@material-ui/icons';

function Post(props) {
  const {
    imageUrl,
    avatar,
    user,
    username,
    postId,
    caption,
    userImg,
    timeStamp,
  } = props;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [openEditPost, setOpenEditPost] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [commentId, setCommentId] = useState('');

  useEffect(() => {
    let unsubscribe;

    unsubscribe = db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({ id: doc.id, comment: doc.data() }))
        );
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

  const updateComment = () => {
    console.log('POST ID >>>>>>>> ', postId);
    console.log('COMMENT ID >>>>>>>> ', commentId);
    db.collection('posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId)
      .set(
        {
          text: comment,
        },
        { merge: true }
      );
    setOpenEditComment(false);
    setCommentId('');
    setComment('');
  };

  const editComment = (id) => {
    console.log('Comment ID +++++++', id);
    setOpenEditComment(true);
    setCommentId(id);
    console.log('STATE ++++ Comment ID +++++++', commentId);
  };

  const postTime = (timeStamp) => {
    const postTimeInMs = timeStamp * 1000;

    const calcDayPassed = (today, postDay) =>
      Math.round(Math.abs(today - postDay) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDayPassed(new Date(), new Date(postTimeInMs));

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    else {
      return new Intl.DateTimeFormat('en-us').format(postTimeInMs);
    }
  };

  return (
    <div className="post">
      <div className="post__header">
        <div className="post__header--left">
          <Avatar
            className="post__header--avatar"
            alt="User Avatar"
            src={avatar}
          />
          <div>
            <h3 className="post__header--name">{username}</h3>
            {/* <h5 className="post__header--timestamp">{timeStamp}</h5> */}
            <h5 className="post__header--timestamp">{postTime(timeStamp)}</h5>
          </div>
        </div>

        {user === username ? (
          <div className="post__header--right">
            <button onClick={(e) => setOpenEditPost(true)}>
              <Edit className="edit-icon" />
            </button>
            <button
              onClick={(e) => db.collection('posts').doc(postId).delete()}
            >
              <DeleteForever className="delete-icon" />
            </button>
          </div>
        ) : (
          ''
        )}

        <Modal open={openEditPost} onClose={(e) => setOpenEditPost(false)}>
          <PostUpdate postId={postId} setOpenEditPost={setOpenEditPost} />
        </Modal>
      </div>

      <div className="post__body">
        <img className="post__body--img" src={imageUrl} alt="Post Image" />
      </div>

      <div className="post__footer">
        <h4 className="post__footer--text">{caption}</h4>
        <div className="post__comments">
          <p className="post__comments--title">
            Comments 
            <RateReview />
          </p>
          {comments.map(({ id, comment }) => (
            <p className="post__comments--wrap">
              {/* {console.log('ID & CMT', id, comment)} */}
              <div className="post__comments--main">
                <img
                  src={comment.userImg ? comment.userImg : userIcon}
                  alt=""
                  className="post__comments--userImg"
                />
                <strong>{comment.writer}</strong>
                <span className="post__comments--span">{comment.text}</span>
                <span className="post__header--timestamp">
                  {postTime(comment.timestamp.seconds)}
                </span>
              </div>
              {user === comment.writer ? (
                <div>
                  <button onClick={(e) => editComment(id)}>
                    <Edit className="edit-icon" />
                  </button>
                  <button
                    onClick={(e) =>
                      db
                        .collection('posts')
                        .doc(postId)
                        .collection('comments')
                        .doc(id)
                        .delete()
                    }
                  >
                    <DeleteForever className="delete-icon" />
                  </button>
                </div>
              ) : null}
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
        <Modal
          open={openEditComment}
          onClose={(e) => setOpenEditComment(false)}
        >
          <div>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              // placeholder={comment}
            ></input>
            <button onClick={updateComment}>Update</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Post;
