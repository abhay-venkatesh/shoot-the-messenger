// The sideways ellipses used to open the 'remove' menu. To the left of each
// message, generally visible on hover.
MORE_BUTTONS_HOLDER_QUERY = '[aria-label="Message actions"]';
// '[data-testid="outgoing_group"] [aria-label="Message actions"]';
MORE_BUTTONS_QUERY = '[aria-label="More"]';

// The button used to open the remove confirmation dialog.
REMOVE_BUTTON_QUERY =
  '[aria-label="Remove message"],[aria-label="Remove Message"]';

// The button used to close the 'message removed' post confirmation.
OKAY_BUTTON_QUERY = '[aria-label="Okay"]';

// The button used to get rid of the Could Not Remove Message popup.
COULDNT_REMOVE_QUERY = '._3quh._30yy._2t_._5ixy.layerCancel';

// The button used to confirm the message removal.
REMOVE_CONFIRMATION_QUERY = '[aria-label="Remove"]';

// The holder for all of the messages in the chat.
SCROLLER_QUERY =
  '[role="main"] .buofh1pr.j83agx80.eg9m0zos.ni8dbmo4.cbu4d94t.gok29vw1';
MESSAGES_QUERY = '[aria-label=Messages]';

// The loading animation.
LOADING_QUERY = '[role="main"] svg[aria-valuetext="Loading..."]';

// The div at the very top of the message chain.
TOP_OF_CHAIN_QUERY =
  '.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.gk29lw5a.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d9wwppkn.fe6kdd0r.mau55g9w.c8b282yb.hrzyx87i.o3w64lxj.b2s5l15y.hnhda86s.oo9gr5id.oqcyycmt';

// The div holding the inbox (used for scrolling).
INBOX_QUERY =
  '.q5bimw55.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.eg9m0zos.l9j0dhe7.du4w35lb.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.c3g1iek1.k4xni2cv';

// Sticker query.
STICKER_QUERY = '[aria-label$=sticker]';

// Link query.
LINK_QUERY = "[alt='XMA Header Image']";

// Thumbs up.
THUMBS_UP = '[aria-label="Thumbs up sticker"]';

// Status messages.
STATUS_MESSAGES = '.nred35xi.fdg1wqfs.ae35evdt.lt9micmv.gl4o1x5y';
TIMESTAMPS = '[data-scope="date_break"]';

const STATUS = {
  CONTINUE: 'continue',
  ERROR: 'error',
  COMPLETE: 'complete',
};

// Helper functions ----------------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSiblings(el) {
  // Setup siblings array and get the first sibling
  var siblings = [];
  var sibling = el.parentNode.firstChild;

  // Loop through each sibling and push to the array
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== el) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }

  return siblings;
}

// Removal functions ---------------------------------------------------------
function removeBadRowsFromDOM() {
  const elementsToRemove = [
    ...document.querySelectorAll(
      `${STICKER_QUERY}, ${LINK_QUERY}, ${THUMBS_UP}`,
    ),
  ];
  console.log('Removing bad rows from dom: ', elementsToRemove);
  for (let badEl of elementsToRemove) {
    let el = badEl;
    try {
      while (el.getAttribute('role') !== 'row') el = el.parentElement;
      el.remove();
    } catch (err) {
      console.log(err);
    }
  }

  const elementsToHide = [
    ...document.querySelectorAll(`${STATUS_MESSAGES}, ${TIMESTAMPS}`),
  ];
  console.log('Hiding bad rows from dom: ', elementsToHide);
  for (let badEl of elementsToHide) {
    let el = badEl;
    try {
      while (el.getAttribute('role') !== 'row') el = el.parentElement;
      el.style.display = 'none';
    } catch (err) {
      console.log(err);
    }
  }
}

async function unsendAllVisibleMessages(lastRun, count) {
  // Start by removing messages that cant be unsent (due to fb being weird).
  removeBadRowsFromDOM();

  // Click on all ... buttons that let you select 'more' for all messages you
  // sent.
  const more_buttons_holders = document.querySelectorAll(
    MORE_BUTTONS_HOLDER_QUERY,
  );
  console.log('Found hidden menu holders: ', more_buttons_holders);
  [...more_buttons_holders].map((el) => {
    el.click();
  });

  let more_buttons = [...document.querySelectorAll(MORE_BUTTONS_QUERY)].filter(
    (el) => {
      return el.getAttribute('data-clickcount') < 5;
    },
  );

  const more_button_count = more_buttons.length;
  console.log('Clicking more buttons: ', more_buttons);

  while (more_buttons.length > 0) {
    console.log('Clicking more buttons: ', more_buttons);
    [...more_buttons].map((el) => {
      el.click();
      const prevClickCount = el.getAttribute('data-clickcount');
      el.setAttribute(
        'data-clickcount',
        prevClickCount ? prevClickCount + 1 : 1,
      );
    });
    await sleep(2000);

    // Click on all of the 'remove' popups that appear.
    let numRemoveTrials = 0;
    let remove_buttons = document.querySelectorAll(REMOVE_BUTTON_QUERY);
    while (remove_buttons.length > 0) {
      console.log("remove_buttons.length=%d", remove_buttons.length);
      await sleep(5000);

      console.log('Clicking remove buttons: ', remove_buttons);
      [...remove_buttons].map((el) => {
        el.click();
      });

      numRemoveTrials++;
      console.log("remove trial %d", numRemoveTrials);

      // Click on all of the 'confirm remove' buttons.
      await sleep(5000);
      let unsend_buttons = document.querySelectorAll(REMOVE_CONFIRMATION_QUERY);

      let numUnsendTrials = 0;
      while (unsend_buttons.length > 0) {
        console.log("unsend_buttons.length=%d", unsend_buttons.length);
        console.log('Unsending: ', unsend_buttons);
        for (let unsend_button of unsend_buttons) {
          unsend_button.click();
        }

        numUnsendTrials++;
        console.log("Unsend trial %d", numUnsendTrials)

        await sleep(5000);
        unsend_buttons = document.querySelectorAll(REMOVE_CONFIRMATION_QUERY);
        if(numUnsendTrials >= 3) {
          console.log("too many unsends, skipping");
          [...unsend_buttons].map((el) => {
            el.remove();
          });
          console.log("clearing unsend buttons");
          unsend_buttons.length = 0;
          console.log("also sleeping for 45s");
          await sleep(45000);
        }
      }

      remove_buttons = document.querySelectorAll(REMOVE_BUTTON_QUERY);
      if (numRemoveTrials >= 3) {
        console.log("too many removes, skipping");
        [...remove_buttons].map((el) => {
          el.remove();
        });
        console.log("clearing remove buttons");
        remove_buttons.length = 0;
        console.log("also sleeping for 45s");
        await sleep(45000);
      }
    }
    more_buttons = [...document.querySelectorAll(MORE_BUTTONS_QUERY)].filter(
      (el) => {
        return el.getAttribute('data-clickcount') < 5;
      },
    );
  }

  // If this is the last run before the runner cycle finishes, dont keep
  // scrolling up.
  if (lastRun) {
    return { status: STATUS.CONTINUE, data: 500 };
  }

  // Cleaned out all the couldnt remove buttons. Now, check to see if we need
  // to hit the 'Load More' button or if we need to scroll up.
  const scroller_ = document.querySelector(SCROLLER_QUERY);
  const topOfChain = document.querySelector(TOP_OF_CHAIN_QUERY);
  await sleep(2000);
  if (topOfChain) {
    // We hit the top. Bubble this info back up.
    console.log('Reached top of chain: ', topOfChain);
    return { status: STATUS.COMPLETE };
  } else if (scroller_ && scroller_.scrollTop !== 0) {
    let loader = null;

    // Sometimes the loader gets stuck. Move on after some attempts.
    let loaderFailsafe = 16;
    do {
      // If we don't have any load more buttons, just try scrolling up.
      console.log('Trying to scroll up.');
      try {
        scroller_.scrollTop = 0;
      } catch (err) {
        console.log(err);
      }

      // Don't continue until the loading animation is gone.
      console.log('sleeping for 2s before getting loader');
      await sleep(2000);
      loader = document.querySelector(LOADING_QUERY);
      console.log('Waiting for loading messages to populate...', loader);
      console.log('sleeping for 2s while waiting');
      await sleep(2000);
      loaderFailsafe--;
      console.log("%d scroll up attempts remaining", loaderFailsafe);
    } while (loader && loaderFailsafe > 0);
  } else {
    // Something is wrong. We dont have load more OR scrolling, but we havent
    // hit the top either.
    console.log(
      'No scroller or load buttons, but we didnt hit the top. Failing.',
    );
    return { status: STATUS.ERROR };
  }

  // And then run the whole thing again after 500ms for loading if we didnt
  // have any removals (to zoom up quickly), or 30s if we did have removals to
  // avoid any rate limiting.
  if (more_button_count === 0) {
    return { status: STATUS.CONTINUE, data: 500 };
  } else {
    return { status: STATUS.CONTINUE, data: 30000 };
  }
}

async function runner(count) {
  console.log('Starting runner removal for N iterations: ', count);
  for (let i = 0; i < count || !count; ++i) {
    console.log('Running count:', i);
    const sleepTime = await unsendAllVisibleMessages(i == count - 1, 100);
    if (sleepTime.status === STATUS.CONTINUE) {
      await sleep(sleepTime.data);
    } else if (sleepTime.status === STATUS.COMPLETE) {
      return STATUS.COMPLETE;
    }
  }
  console.log('Completed run.');
  return STATUS.CONTINUE;
}

async function longChain(count, runnerCount, searchText) {
  searchText = searchText ? searchText : '';
  for (let i = 0; i < count || !count; ++i) {
    console.log('On run: ', i);
    const status = await runner(runnerCount);
    console.log('Runner status: ', status);
    if (status === STATUS.COMPLETE) return { status: status };
  }

  // We haven't finished, so we need to refresh and continue.
  return { status: STATUS.CONTINUE };
}

// Scroller functions --------------------------------------------------------
function scrollToBottomHelper() {
  let scroller = document.querySelectorAll(INBOX_QUERY)[0];
  scroller.scrollTop = scroller.scrollHeight;
}

async function scrollToBottom(limit) {
  for (let i = 0; i < limit; ++i) {
    scrollToBottomHelper();
    await sleep(2000);
  }
}

async function scrollToTopHelper() {
  console.log('Trying to scroll up.');
  const scroller_ = document.querySelector(SCROLLER_QUERY);
  let topOfChain = document.querySelector(TOP_OF_CHAIN_QUERY);
  console.log("topOfChain=", topOfChain);
  while(topOfChain == null) {
    console.log("scrolling");
    try {
      scroller_.scrollTop = 0;
    } catch (err) {
      console.log(err);
    }
    topOfChain = document.querySelector(TOP_OF_CHAIN_QUERY);
    console.log("sleeping for 2s");
    await sleep(2000);
  }
}

// Handlers ------------------------------------------------------------------
const currentURL = location.protocol + '//' + location.host + location.pathname;

async function removeHandler(tabId) {
  const status = await longChain(5, 5);
  if (status.status === STATUS.COMPLETE) {
    console.log(
      'Possibly successfully removed all messages. Running one more confirmation attempt.',
    );
    chrome.runtime.sendMessage({
      action: 'STORE',
      data: { [currentURL]: { confirmSuccess: true } },
      response: { tabId: tabId, action: 'RELOAD' },
    });
  } else if (status.status === STATUS.CONTINUE) {
    console.log('Completed runner iteration but did not finish removal.');
    chrome.runtime.sendMessage({
      action: 'STORE',
      data: { [currentURL]: { isRemoving: true } },
      response: { tabId: tabId, action: 'RELOAD' },
    });
  } else {
    console.log('Failed to complete longChain removal.');
  }
}

(function () {
  chrome.runtime.onMessage.addListener(async function (msg, sender) {
    // Make sure we are using english language messenger.
    if (document.documentElement.lang !== 'en') {
      alert(
        'ERROR: detected non-English language. Shoot the Messenger only works when Facebook settings are set to English. Please change your profile settings and try again.',
      );
      return;
    }

    console.log('Got action: ', msg.action);
    const tabId = msg.tabId;
    if (msg.action === 'REMOVE') {
      removeHandler(tabId);
    } else if (msg.action === 'CONFIRM_REMOVE') {
      const keep_removing = confirm('Continue removing messages?');
      if (keep_removing) removeHandler(tabId);
    } else if (msg.action === 'CONFIRM_SUCCESS') {
      await sleep(10000);
      const maybeSuccess = runner(3);
      if (maybeSuccess.status === STATUS.CONTINUE) {
        chrome.runtime.sendMessage({
          action: 'STORE',
          data: { [currentURL]: { isRemoving: true } },
        });
        removeHandler(tabId);
      } else if (maybeSuccess.status === STATUS.COMPLETE) {
        console.log('Successful confirmation! All cleared!');
        chrome.runtime.sendMessage({
          action: 'STORE',
          data: { [currentURL]: { lastCleared: new Date().toDateString() } },
        });
      } else {
        console.log('Got error during confirmation attempt. Failing.');
        chrome.runtime.sendMessage({
          action: 'STORE',
          data: { [currentURL]: { isRemoving: true } },
          response: { tabId: tabId, action: 'RELOAD' },
        });
      }
    } else if (msg.action === 'SCROLL') {
      console.log("attempting to scroll to bottom");
      scrollToBottom(100);
      // await scrollToTopHelper();
    } else if (msg.action === 'RELOAD') {
      window.location = window.location.pathname;
    } else {
      console.log('Unknown action.');
    }
  });

  // Check to see if we need to kick off a removal request.
  console.log('Checking existing removal process.');
  chrome.runtime.sendMessage({
    action: 'CHECK_ALREADY_REMOVING',
  });
})();
