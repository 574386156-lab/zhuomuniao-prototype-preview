(function (root) {
  "use strict";

  var source = "assets/modern-soft-three-tone-organ.wav";
  var activePatientKey = null;
  var player = null;
  var bufferPromise = null;

  function playWithContext(context) {
    if (!context || context.state !== "running" || typeof fetch !== "function" || typeof context.decodeAudioData !== "function") return false;
    if (!bufferPromise) {
      bufferPromise = fetch(source).then(function (response) {
        if (!response.ok) throw new Error("audio_fetch_failed");
        return response.arrayBuffer();
      }).then(function (data) {
        return context.decodeAudioData(data);
      });
    }
    bufferPromise.then(function (buffer) {
      var node = context.createBufferSource();
      var gain = context.createGain();
      node.buffer = buffer;
      gain.gain.value = 0.72;
      node.connect(gain);
      gain.connect(context.destination);
      node.start(0);
      node.onended = function () { node.disconnect(); gain.disconnect(); };
    }).catch(function () {});
    return true;
  }

  function playNewPatientEntry(patientKey, context) {
    if (!patientKey || patientKey === activePatientKey) return false;
    activePatientKey = patientKey;

    try {
      if (playWithContext(context)) return true;
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
