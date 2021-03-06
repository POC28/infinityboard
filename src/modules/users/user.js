'use strict';

import bcrypt from 'bcrypt-nodejs';

export default class User {
  constructor(repository, boardRepository) {
    this.repository = repository;
    this.boardRepository = boardRepository;
  }

  register(user) {
    return new Promise((resolve, reject) => {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

      this.repository.register(user).then(newUser => {
        if(!newUser) {
          return resolve(null);
        }

        this.boardRepository.create({ title: '' }).then(board => {
          this.update(newUser.id, { root_board: board.id }).then(() => {
            newUser.root_board = board.id;
            resolve(newUser);
          }, reject);
        }, reject);
      }, reject);
    });
  }

  login(credentials) {
    return new Promise((resolve, reject) => {
      this.repository.getByUsername(credentials.username).then(user => {
        if(!user || !bcrypt.compareSync(credentials.password, user.password)) {
          return resolve(false);
        }
        
        resolve(user);
      }, reject);
    });
  }

  getByUsername(username) {
    return this.repository.getByUsername(username);
  }

  update(id, updates) {
    updates = Object.assign({}, updates);
    delete updates.username;
    return this.repository.update(id, updates);
  }
}
