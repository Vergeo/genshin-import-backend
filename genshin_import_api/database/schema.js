const schema = `
CREATE TABLE IF NOT EXISTS users (
    user_id   INT(10)      NOT NULL AUTO_INCREMENT,
    username  VARCHAR(50)  NOT NULL,
    password  VARCHAR(50)  NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role      VARCHAR(50)  NOT NULL,
    refresh_token VARCHAR(500) NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS items (
    item_id          INT(10)        NOT NULL AUTO_INCREMENT,
    item_name        VARCHAR(100)   NOT NULL,
    item_type        VARCHAR(50)    NOT NULL,
    item_description VARCHAR(2000),
    item_stock       INT(10)        NOT NULL DEFAULT 0,
    item_image       VARCHAR(500),
    item_price       DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (item_id)
);

CREATE TABLE IF NOT EXISTS sales (
    sales_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id  INT(10) NOT NULL,
    item_id  INT(10) NOT NULL,
    quantity INT(10) NOT NULL,
    PRIMARY KEY (sales_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id INT(10) NOT NULL AUTO_INCREMENT,
    user_id     INT(10) NOT NULL,
    item_id     INT(10) NOT NULL,
    PRIMARY KEY (wishlist_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);
`

module.exports = schema;