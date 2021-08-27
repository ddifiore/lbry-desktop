import { makeSelectRecommendedClaimIds } from 'redux/selectors/content';
import { selectUser } from 'redux/selectors/user';
import { makeSelectRecommendedRecsysIdForClaimId } from 'redux/selectors/search';
import { v4 as Uuidv4 } from 'uuid';

const recsysEndpoint = 'https://clickstream.odysee.com/log/video/view';
const recsysId = 'lighthouse-v0';

const recsys = {
  entries: {},
  debug: true,
  /**
   * Provides for creating, updating, and sending Clickstream data object Entries.
   * Entries are Created either when recommendedContent loads, or when recommendedContent is clicked.
   * If recommended content is clicked, An Entry with parentUuid is created.
   * On page load, find an empty entry with your claimId, or create a new entry and record to it.
   * The entry will be populated with the following:
   *  - parentUuid // optional
   *  - Uuid
   *  - claimId
   *  - recommendedClaims [] // optionally empty
   *  - playerEvents [] // optionally empty
   *  - recommendedClaimsIndexClicked [] // optionally empty
   *  - UserId
   *  - pageLoadedAt
   *  - isEmbed
   *  - pageExitedAt
   *  - recsysId // optional
   */

  /**
   * Function: clickedRecommended()
   * Called when RecommendedContent was clicked.
   * Adds index of clicked recommendation to parent
   * Adds new Entry with parentUuid for destination page
   * @param parentClaimId: string,
   * @param newClaimId: string,
   */
  clickedRecommended: function (parentClaimId, newClaimId) {
    const parentEntry = recsys.entries[parentClaimId] ? recsys.entries[parentClaimId] : null;
    const parentUuid = parentEntry['Uuid'];
    const parentRecommendedClaims = parentEntry['recClaimIds'] || [];
    const indexClicked = parentRecommendedClaims.indexOf(newClaimId);
    console.log('indexClicked');

    if (parentUuid) {
      recsys.createEntry(newClaimId, parentUuid);
    }
    parentRecommendedClaims.push(indexClicked);
    recsys.log('clickedRecommended');
  },

  /**
   * Page was loaded. Get or Create entry and populate it with default data, plus recommended content, recsysId, etc.
   * Called from recommendedContent component
   */
  recsLoaded: function (claimId) {
    if (window.store) {
      const state = window.store.getState();
      if (!recsys.entries[claimId]) {
        recsys.createEntry(claimId);
      }
      const claimids = makeSelectRecommendedClaimIds(claimId)(state);
      console.log('claimIds', claimids);
      recsys.entries[claimId]['recsysId'] = makeSelectRecommendedRecsysIdForClaimId(claimId)(state) || recsysId;
      recsys.entries[claimId]['pageLoadedAt'] = Date.now();
      recsys.entries[claimId]['recClaimIds'] = claimids;
    }
    recsys.log('recsLoaded', claimId);
  },

  /**
   * Creates an Entry with optional parentUuid
   * @param: claimId: string
   * @param: parentUuid: string (optional)
   */
  createEntry: function (claimId, parentUuid) {
    if (window.store) {
      const state = window.store.getState();
      const { id: userId } = selectUser(state);
      if (parentUuid) {
        // Make a stub entry that will be filled out on page load
        recsys.entries[claimId] = {
          uuid: Uuidv4(),
          // parentUuid: // passed in makeSelectRecommendationParentId(claimId)(state),
          uid: userId || null, // selectUser
          claimId: claimId,
        };
      } else {
        recsys.entries[claimId] = {
          uuid: Uuidv4(),
          uid: userId, // selectUser
          claimId: claimId,
          pageLoadedAt: Date.now(),
          recsysId: makeSelectRecommendedRecsysIdForClaimId(claimId)(state) || recsysId,
          recClaimIds: makeSelectRecommendedClaimIds(claimId)(state),
          recClickedVideoIdx: [],
          events: [],
          isEmbed: null,
        };
      }
    }
    recsys.log('createEntry');
  },

  /**
   * Send event for claimId
   * @param claimId
   * @param isTentative
   */
  sendRecsysEvent: function (claimId, isTentative) {
    if (recsys.entries[claimId]) {
      if (isTentative) {
        recsys.entries[claimId]['tentative'] = true;
      }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // application/json
        body: JSON.stringify(recsys.entries[claimId]),
      };

      try {
        if (recsys.debug) console.log('Recsys sent', requestOptions);
        fetch(recsysEndpoint, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (!isTentative) {
              delete recsys.entries[claimId];
            }
          });
      } catch (error) {
        if (recsys.debug) console.log('Recsys failed', requestOptions);
        // console.error(`Recsys Error`, error);
      }
    }
    recsys.log('sendRecsysEvent');
  },

  /**
   * A player event fired. Get the Entry for the claimId, and add the events
   * @param claimId
   * @param event
   */
  addRecsysPlayerEvent: function (claimId, event) {
    if (!recsys.entries[claimId]) {
      recsys.createEntry(claimId);
      // do something to show it's floating or autoplay
    }
    recsys.entries[claimId].events.push(event);
    recsys.log('addRecsysPlayerEvent');
  },
  log: function (callName) {
    if (recsys.debug) {
      console.log(`Call: ${callName}, Recsys Entries`, recsys.entries);
    }
  },
};

export default recsys;
