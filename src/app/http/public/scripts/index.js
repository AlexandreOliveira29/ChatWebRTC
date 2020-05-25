let isAlreadyCalling = false;
let getCalled = false;

const existingCalls = [];

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

function unselectUsersFromList() {
  const alreadySelectedUser = document.querySelectorAll(
    '.active-user.active-user--selected'
  );

  alreadySelectedUser.forEach((el) => {
    el.setAttribute('class', 'active-user');
  });
}

function createUserItemContainer(socketId, userId, name) {
  const userContainerEl = document.createElement('div');

  const usernameEl = document.createElement('p');

  userContainerEl.setAttribute('class', 'active-user');
  userContainerEl.setAttribute('id', socketId);
  usernameEl.setAttribute('class', 'username');
  usernameEl.innerHTML = `Name: ${name} - ${userId}`;

  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener('click', () => {
    unselectUsersFromList();
    userContainerEl.setAttribute('class', 'active-user active-user--selected');
    const talkingWithInfo = document.getElementById('talking-with-info');
    talkingWithInfo.innerHTML = `Talking with: "Name: ${name} - ${userId}"`;
    callUser(socketId);
  });

  return userContainerEl;
}

async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit('call-user', {
    offer,
    to: socketId
  });
}

function updateUserList(socketClients) {
  const activeUserContainer = document.getElementById('active-user-container');

  console.log(socketClients);

  socketClients.forEach(({ socketId, userId, name }) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId, userId, name);

      activeUserContainer.appendChild(userContainerEl);
    }
  });
}

const socket = io.connect('localhost:3500');

const users = [
  {
    userId: '6ec24ea1-8ed6-47dc-97cb-8d94ef5356c4',
    name: 'Alexandre Oliveira'
  },
  {
    userId: '77d5b26c-81bd-43fe-b640-f2e6f09eb058',
    name: 'João Oliveira'
  },
  {
    userId: 'a96ea114-964d-4311-8b29-6567a1857ba5',
    name: 'Raul Seixas'
  },
  {
    userId: '74d8ffa8-376a-456a-bdff-f0efe6d40fa7',
    name: 'Jupter Plutão'
  },
  {
    userId: 'd680dfe4-dbef-41f9-aed7-e9bbcd5cdd7a',
    name: 'Martes Lunes'
  }
];

socket.on('connect', () => {
  console.log(`User: "Socket: ${socket.id}" connected.`);
  socket.emit('assign-client', users[parseInt(Math.random() * 5)]);
});

socket.on('disconnect', () => {
  console.log(`User: "Socket: ${socket.id}" disconnected.`);
});

socket.on('update-user-list', ({ users }) => {
  updateUserList(users);
});

socket.on('remove-user', ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
});

socket.on('call-made', async (data) => {
  if (getCalled) {
    const confirmed = confirm(
      `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
    );

    if (!confirmed) {
      socket.emit('reject-call', {
        from: data.socket
      });

      return;
    }
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit('make-answer', {
    answer,
    to: data.socket
  });
  getCalled = true;
});

socket.on('answer-made', async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );

  if (!isAlreadyCalling) {
    callUser(data.socket);
    isAlreadyCalling = true;
  }
});

socket.on('call-rejected', (data) => {
  alert(`User: "Socket: ${data.socket}" rejected your call.`);
  unselectUsersFromList();
});

peerConnection.ontrack = function ({ streams: [stream] }) {
  const remoteVideo = document.getElementById('remote-video');
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

navigator.getUserMedia(
  { video: true, audio: true },
  (stream) => {
    const localVideo = document.getElementById('local-video');
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
  },
  (error) => {
    console.warn(error.message);
  }
);
