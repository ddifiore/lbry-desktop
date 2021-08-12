// @flow
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import React from 'react';
import { MenuList, MenuItem } from '@reach/menu-button';
import ChannelThumbnail from 'component/channelThumbnail';
import Icon from 'component/common/icon';
import { parseURI } from 'lbry-redux';

type Props = {
  uri: ?string,
  authorUri: string, // full LBRY Channel URI: lbry://@channel#123...
  commentId: string, // sha256 digest identifying the comment
  isTopLevel: boolean,
  isPinned: boolean,
  commentIsMine: boolean, // if this comment was signed by an owned channel
  disableEdit?: boolean,
  disableRemove?: boolean,
  supportAmount?: any,
  handleEditComment: () => void,
  // --- select ---
  claim: ?Claim,
  claimIsMine: boolean,
  contentChannelPermanentUrl: any,
  activeChannelClaim: ?ChannelClaim,
  playingUri: ?PlayingUri,
  // --- perform ---
  openModal: (id: string, {}) => void,
  clearPlayingUri: () => void,
  muteChannel: (string) => void,
  pinComment: (string, string, boolean) => Promise<any>,
  commentModAddDelegate: (string, string, ChannelClaim) => void,
  setQuickReply: (any) => void,
};

function CommentMenuList(props: Props) {
  const {
    uri,
    claim,
    authorUri,
    commentIsMine,
    commentId,
    muteChannel,
    pinComment,
    clearPlayingUri,
    activeChannelClaim,
    contentChannelPermanentUrl,
    isTopLevel,
    isPinned,
    handleEditComment,
    commentModAddDelegate,
    playingUri,
    disableEdit,
    disableRemove,
    openModal,
    supportAmount,
    setQuickReply,
  } = props;

  const activeChannelIsCreator = activeChannelClaim && activeChannelClaim.permanent_url === contentChannelPermanentUrl;

  function handlePinComment(commentId, claimId, remove) {
    pinComment(commentId, claimId, remove);
  }

  function handleDeleteComment() {
    if (playingUri && playingUri.source === 'comment') {
      clearPlayingUri();
    }
    openModal(MODALS.CONFIRM_REMOVE_COMMENT, {
      commentId,
      commentIsMine,
      contentChannelPermanentUrl,
      supportAmount,
      setQuickReply,
    });
  }

  function handleCommentBlock() {
    openModal(MODALS.BLOCK_CHANNEL, { contentUri: uri, commenterUri: authorUri });
  }

  function handleCommentMute() {
    muteChannel(authorUri);
  }

  function assignAsModerator() {
    if (activeChannelClaim && authorUri) {
      const { channelName, channelClaimId } = parseURI(authorUri);
      commentModAddDelegate(channelClaimId, channelName, activeChannelClaim);
    }
  }

  return (
    <MenuList className="menu__list">
      {activeChannelIsCreator && <div className="comment__menu-title">{__('Creator tools')}</div>}

      {activeChannelIsCreator && isTopLevel && (
        <MenuItem
          className="comment__menu-option menu__link"
          onSelect={() => handlePinComment(commentId, claim ? claim.claim_id : '', isPinned)}
        >
          <span className={'button__content'}>
            <Icon aria-hidden icon={ICONS.PIN} className={'icon'} />
            {isPinned ? __('Unpin') : __('Pin')}
          </span>
        </MenuItem>
      )}

      {activeChannelIsCreator && (
        <MenuItem className="comment__menu-option" onSelect={assignAsModerator}>
          <div className="menu__link">
            <Icon aria-hidden icon={ICONS.ADD} />
            {__('Add as moderator')}
          </div>
          <span className="comment__menu-help">
            {__('Assign this user to moderate %channel%', {
              channel: activeChannelClaim ? activeChannelClaim.name : __('your channel'),
            })}
          </span>
        </MenuItem>
      )}

      {!disableRemove &&
        activeChannelClaim &&
        (activeChannelClaim.permanent_url === authorUri ||
          activeChannelClaim.permanent_url === contentChannelPermanentUrl) && (
          <MenuItem className="comment__menu-option" onSelect={handleDeleteComment}>
            <div className="menu__link">
              <Icon aria-hidden icon={ICONS.DELETE} />
              {__('Remove')}
            </div>
          </MenuItem>
        )}

      {commentIsMine && activeChannelClaim && activeChannelClaim.permanent_url === authorUri && !disableEdit && (
        <MenuItem className="comment__menu-option menu__link" onSelect={handleEditComment}>
          <Icon aria-hidden icon={ICONS.EDIT} />
          {__('Edit')}
        </MenuItem>
      )}

      {!commentIsMine && (
        <MenuItem className="comment__menu-option" onSelect={handleCommentBlock}>
          <div className="menu__link">
            <Icon aria-hidden icon={ICONS.BLOCK} />
            {__('Block')}
          </div>
          {activeChannelIsCreator && (
            <span className="comment__menu-help">{__('Prevent this channel from interacting with you.')}</span>
          )}
        </MenuItem>
      )}

      {!commentIsMine && (
        <MenuItem className="comment__menu-option" onSelect={handleCommentMute}>
          <div className="menu__link">
            <Icon aria-hidden icon={ICONS.MUTE} />
            {__('Mute')}
          </div>
          {activeChannelIsCreator && (
            <span className="comment__menu-help">{__('Hide this channel for you only.')}</span>
          )}
        </MenuItem>
      )}

      {activeChannelClaim && (
        <div className="comment__menu-active">
          <ChannelThumbnail xsmall noLazyLoad uri={activeChannelClaim.permanent_url} />
          <div className="comment__menu-channel">
            {__('Interacting as %channelName%', { channelName: activeChannelClaim.name })}
          </div>
        </div>
      )}
    </MenuList>
  );
}

export default CommentMenuList;
