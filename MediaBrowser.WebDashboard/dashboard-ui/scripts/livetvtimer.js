﻿(function (window, $, document, apiClient) {

    var currentItem;

    function deleteTimer(page, id) {

        Dashboard.confirm("Are you sure you wish to cancel this recording?", "Confirm Recording Cancellation", function (result) {

            if (result) {

                Dashboard.showLoadingMsg();

                ApiClient.cancelLiveTvTimer(id).done(function () {

                    Dashboard.alert('Recording cancelled.');

                    reload(page);
                });
            }

        });
    }

    function renderTimer(page, item) {

        var context = 'livetv';
        currentItem = item;

        var programInfo = item.ProgramInfo || {};

        $('.itemName', page).html(programInfo.Name);
        
        $('.itemEpisodeName', page).html(programInfo.EpisodeTitle || '');

        if (programInfo.CommunityRating) {
            $('.itemCommunityRating', page).html(LibraryBrowser.getRatingHtml(programInfo)).show();
        } else {
            $('.itemCommunityRating', page).hide();
        }

        LibraryBrowser.renderGenres($('.itemGenres', page), programInfo, context);
        LibraryBrowser.renderOverview($('.itemOverview', page), programInfo);

        $('.itemMiscInfo', page).html(LibraryBrowser.getMiscInfoHtml(item));

        LiveTvHelpers.renderMiscProgramInfo($('.miscTvProgramInfo', page), programInfo);

        $('#txtPrePaddingSeconds', page).val(item.PrePaddingSeconds / 60);
        $('#txtPostPaddingSeconds', page).val(item.PostPaddingSeconds / 60);
        $('#chkPrePaddingRequired', page).checked(item.IsPrePaddingRequired).checkboxradio('refresh');
        $('#chkPostPaddingRequired', page).checked(item.IsPostPaddingRequired).checkboxradio('refresh');

        $('.status', page).html('Status:&nbsp;&nbsp;&nbsp;' + item.Status);

        Dashboard.hideLoadingMsg();
    }

    function onSubmit() {

        Dashboard.showLoadingMsg();

        var form = this;

        apiClient.getLiveTvTimer(currentItem.Id).done(function (item) {

            item.PrePaddingSeconds = $('#txtPrePaddingSeconds', form).val() * 60;
            item.PostPaddingSeconds = $('#txtPostPaddingSeconds', form).val() * 60;
            item.IsPrePaddingRequired = $('#chkPrePaddingRequired', form).checked();
            item.IsPostPaddingRequired = $('#chkPostPaddingRequired', form).checked();

            ApiClient.updateLiveTvTimer(item).done(function () {
                Dashboard.alert('Timer Saved');
            });
        });

        // Disable default form submission
        return false;

    }

    function reload(page) {

        Dashboard.showLoadingMsg();

        var id = getParameterByName('id');

        apiClient.getLiveTvTimer(id).done(function (result) {

            renderTimer(page, result);

        });
    }

    $(document).on('pageinit', "#liveTvTimerPage", function () {

        var page = this;

        $('#btnCancelTimer', page).on('click', function () {

            deleteTimer(page, currentItem.Id);

        });

    }).on('pagebeforeshow', "#liveTvTimerPage", function () {

        var page = this;

        reload(page);

    }).on('pagehide', "#liveTvTimerPage", function () {

        currentItem = null;
    });

    function liveTvTimerPage() {

        var self = this;

        self.onSubmit = onSubmit;
    }

    window.LiveTvTimerPage = new liveTvTimerPage();

})(window, jQuery, document, ApiClient);