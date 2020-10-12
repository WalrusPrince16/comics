// * DOM

const
    $nav = $('#nav'),
    $navList = $('#nav__box'),
    $episodeBox = $('#episode__box'),
    $users = $('.options button'),
    $toggleMenus = $('#toggle'),
    $titleContent = $('#titleContent'),
    $pics = $('.authors__pic');

// * Import Data

import epData from './data.js';

// * Possible Navigation Configurations

// * Init Functions

function init() {
    // * Takes an episode in the format of epData[episode]
    // Optional Arguments of first page load, and append episode
    changeEpisode(epData.creeperEpsLength, true);
    // * Generates a title for smaller screens
    generateTitle();
    updateTitleOnScroll();
    makeTableOfContents();
    addEventsListeners();
}

function generateTitle() {
    let numOfEp = document.getElementById('title');
    let titleOfEp = document.getElementById('titleSubtext');
    let episodeTitle = epData[epData.creeperEps.length - 1].title.split(':');
    if (numOfEp.innerText) return;
    numOfEp.innerText = episodeTitle[0];
    titleOfEp.innerText = episodeTitle[1];
}

function addEventsListeners() {
    $(".author button").on('click', function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#episode__box").offset().top
        }, 800);
    });

    $users.on('click', highlightSelection);

    $nav.on('click', () => navState(false, false, true, true));

    $toggleMenus.on('click', () => {
        $toggleMenus.toggleClass('on');
        $toggleMenus.hasClass('on') ? navState(true, true) : navState(false, false);
    });

    $pics.on('click', changeOnPicClick);

    window.addEventListener('scroll', updateTitleOnScroll);

    $("#creeperGoToFirstEpisode").on("click", () => changeEpisode(epData.firstCreeperEp, true));
    $("#creeperGoToLastEpisode").on("click", () => changeEpisode(epData.creeperEpsLength, true));
    $("#dofGoToFirstEpisode").on("click", () => changeEpisode(epData.firstDofEp, true));
    $("#dofGoToLastEpisode").on("click", () => changeEpisode(`${epData.dofEpsLength}a`, true));
    $("#creeperGoToLatestStory").on("click", () => addStory('creeper1s', false));
}

// * Navigation Functions

function navState(titleElem, navElem, navListToggle = false, navTextToggle = false) {
    (titleElem) ? $titleContent.addClass('move'): $titleContent.removeClass('move');
    (navElem) ? $nav.addClass('move'): $nav.removeClass('move');
    if (navListToggle) $navList.toggleClass('nav__box--open');
    if (navTextToggle) window.setTimeout(() => $nav.text().trim() == "BROWSE" ? $nav.text("BACK") : $nav.text("BROWSE"), 300);
}

function addStory(story, openedFromNav = false) {
    (openedFromNav) ? navState(false, false, true, true): navState(false, false);
    $episodeBox.html("").append($( /*html*/ `<div id="${story}" class="episode episode--story"></div>`).html(epData[story].textContent));
}

function createContentHeading(season) {
    let $seasonHeadingUL = $( /*html*/ `<ul class="nav-list__ul ${epData[season].author}"></ul>`).html( /*html*/ `<li class="nav-list__ul-head flex justify-between items-center pt-4 border-b">${epData[season].title} <i class="nav__arrow fas fa-arrow-circle-down"></i></li>`);
    $seasonHeadingUL.on('click', function () {
        $(this).children().each(function () {
            $(this).toggleClass('on')
        })
    });
    if ($seasonHeadingUL.hasClass('creeper')) $seasonHeadingUL.addClass('on');
    return $seasonHeadingUL;
}

function createEpisodeInNav(episode, media) {
    let $li = $( /*html*/ `<li id="${episode}" class="nav-list__li pl-5 border-b"></li>`).text(epData[episode].title);
    if (media) {
        $li.on('click', () => addStory($li.attr('id'), true));
    } else {
        $li.on('click', () => changeEpisode($li.attr('id')));
    }
    return $li;
}

function appendContentNav($ul, content) {
    let seasonNumber = epData[content].seasonNum;
    for (const episode in epData) {
        if (seasonNumber == epData[episode].season) {
            let mediaTypeStory = (seasonNumber.includes('s')) ? true : false;
            let $li = createEpisodeInNav(episode, mediaTypeStory);
            $ul.append($li);
        }
    }
}

function makeTableOfContents() {
    $("#nav-list").html("");
    // * Creates a ul for each season and appends each episode to that ul as a li
    for (const content in epData) {
        // ! Collections are denoted with {string}SE{num}
        if (content.includes("SE")) {
            let $contentUL = createContentHeading(content);
            $("#nav-list").append($contentUL);
            appendContentNav($contentUL, content);
        }
    }
}

function changeOnPicClick(e) {
    let author = e.target.id.split('-')[0];
    (epData.activeAuthor < epData.authors.length - 1) ? epData.activeAuthor++: epData.activeAuthor = 0;
    $pics.each(function () {
        ($(this).attr("id").includes(author)) ? $(this).addClass('authors__pic--on'): $(this).removeClass('authors__pic--on')
    });
    let accessEp = epData[`${author}EpsLength`];
    if (author === 'dof') accessEp = accessEp + 'a';
    changeEpisode(accessEp, true);
}

function highlightSelection(e) {
    $users.each(function () {
        $(this).attr('id') === e.target.id || $(this).hasClass(e.target.id) ? $(this).addClass('on') : $(this).removeClass('on')
    });
    $('.nav-list__ul').each(function () {
        $(this).attr('id') === e.target.id || $(this).hasClass(e.target.id) ? $(this).addClass('on') : $(this).removeClass('on')
    });
}

// * Scroll Function

function updateTitleOnScroll() {
    function updateTitleText(id) {
        let episodeData = epData[id].title;
        let epNumAndTitle = episodeData.split(':');
        let numOfEp = document.getElementById('title');
        let titleOfEp = document.getElementById('titleSubtext');
        numOfEp.innerText = epNumAndTitle[0];
        titleOfEp.innerText = epNumAndTitle[1];
    };

    let episodes = document.querySelectorAll('.episode');

    episodes.forEach(
        function checkVisible(elm) {
            var rect = elm.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            if (!(rect.bottom < 0 || rect.top - viewHeight >= 0)) updateTitleText(elm.id);
        }
    )
}

// * Next Episode Button

function getPositionData(arr, ep) {
    // ? arr = { [1, 2, 3, 4, 5, 6, 7], 7 }
    // ? ep = '1' (possibly a normal 1) or '1a'
    return {
        lastEp: arr.indexOf(ep) + 1 === arr.length,
        firstEp: arr.indexOf(ep) === 0,
        get middleEp() {
            return this.lastEp === false && this.firstEp === false
        },
        get nextEpNumber() {
            if (arr.indexOf(ep) <= length && !this.firstEp === false || this.lastEp === false) {
                return arr[arr.indexOf(ep) + 1]
            }
            return false;
        },
        get prevEpNumber() {
            if (!this.firstEp) {
                return arr[arr.indexOf(ep) - 1]
            }
            return false;
        }
    }
}

function createEpButtons(positionData, ep) {
    let {
        lastEp,
        middleEp,
        firstEp,
        prevEpNumber,
        nextEpNumber,
    } = positionData;

    // Container for the Two Buttons
    let $episodeButtonBox = $(`<div class="grid gap-10 grid-cols-2 w-full col-span-1 md:col-span-2"></div>`);
    let $leftEpButton = $( /*html*/ `<button class="ep__btn col-span-1 bg-red-600 text-center w-full p-8 border"></button>`);
    let $rightEpButton = $( /*html*/ `<button class="ep__btn col-span-1 bg-red-600 text-center w-full p-8 border"></button>`);

    if (lastEp) {
        $leftEpButton.text("Prev").attr("id", prevEpNumber).on('click', (e) => changeEpisode(e.target.id, true, false));
        $rightEpButton.text("Browse").removeClass('ep__btn').on('click', () => navState(true, false, true, true));
    }
    if (middleEp) {
        $leftEpButton.text("Prev").attr("id", prevEpNumber).on('click', (e) => changeEpisode(e.target.id, true, false));
        $rightEpButton.text("Next").attr("id", nextEpNumber).on('click', (e) => changeEpisode(e.target.id, true, false));
    }
    if (firstEp) {
        $leftEpButton.text("Browse").removeClass('ep__btn').on('click', () => navState(true, false, true, true));
        $rightEpButton.text("Next").attr("id", nextEpNumber).on('click', (e) => changeEpisode(e.target.id, true, false));
    }

    $(".ep__btn").on('click', (e) => e.parent().html(""));

    $episodeButtonBox.append($leftEpButton, $rightEpButton);

    return $episodeButtonBox;
}

function nextEpisode(ep) {
    // Creates the buttons that will load the next or previous episodes
    ep = ep.toString(); // ? sometimes a number is passed (1)
    let arr = ep.includes('a') ? epData.dofEps : epData.creeperEps;
    let positionData = getPositionData(arr, ep);
    let $buttons = createEpButtons(positionData, ep);
    $(".episode:last-child").append($buttons);
}

// * Episode Functions

function initChangeEpisode(firstLoad, append) {
    updateTitleOnScroll();
    if (!firstLoad) $([document.documentElement, document.body]).animate({
        scrollTop: $("#episode__box").offset().top
    }, 800);
    navState(false, false, !firstLoad, (!firstLoad) ? true : false);
    if (!append) $episodeBox.html("");
}

function changeEpisode(e, firstLoad = false, append = false) {
    initChangeEpisode(firstLoad, append);

    let ep = (e.target) ? e.target.id : e;
    let $episode = $(`<div id="${ep}" class="episode grid sm:grid-cols-1 md:grid-cols-2 gap-10 mb-10">`);

    if (epData[ep].slides === 3) $episode.addClass('odd');

    for (let i = 1; i <= epData[ep].slides; i++) {
        let $slide = $( /*html*/ `<div class="slide border rounded-xl"><img src="./imgs/ep${ep}/slide${i}.PNG" class="slide__img w-full h-auto"/></div>`).on('click', fullScreen);
        $episode.append($slide);
    }

    $episodeBox.append($episode);
    nextEpisode(ep);
}

// * Full Screen Function

function fullScreen(e) {
    $("#fullScreenBox")
        .html(`<img class="transform sm:scale-100 md:scale-150 border" src="${e.target.src}"><div id="close" class="top-0 right-0 p-4 text-5xl absolute"><i class="fas fa-times"></i></div>`)
        .toggleClass('on')
        .on('click', () => {
            $("#fullScreenBox").html("").removeClass('on');
        });
}

// * Init

init();