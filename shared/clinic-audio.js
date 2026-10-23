(function (root) {
  "use strict";

  var source = "assets/modern-soft-three-tone-organ.wav";
  var activePatientKey = null;
  var player = null;

  function playNewPatientEntry(patientKey) {
    if (!patientKey || patientKey === activePatientKey) return false;
    activePatientKey = patientKey;

    try {
      if (!player) {
        player = new root.Audio(source);
        player.preload = "auto";
        player.volume = 0.72;
      }
      player.currentTime = 0;
      var playback = player.play();
      if (playback && typeof playback.catch === "function") playback.catch(function () {});
      return true;
    } catch (error) {
      // The browser may block autoplay. The patient transition itself remains usable.
      return false;
    }
  }

  function reset() {
    activePatientKey = null;
  }

  root.ClinicAudio = {
    playNewPatientEntry: playNewPatientEntry,
    reset: reset
  };
})(window);
