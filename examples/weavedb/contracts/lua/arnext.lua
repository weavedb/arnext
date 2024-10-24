local ao = require("ao")
local json = require("json")
posts = posts or {}

local function checkValidAddress(address)
  if not address or type(address) ~= 'string' then
    return false
  end

  return string.match(address, "^[%w%-_]+$") ~= nil and #address == 43
end

Handlers.add(
  "Post",
  Handlers.utils.hasMatchingTag('Action', 'Post'),
  function(msg)
    assert(type(msg.Tags.Title) == 'string', 'Title is required!')
    assert(type(msg.Tags.Description) == 'string', 'Description is required!')
    assert(msg.Tags.Image == nil or checkValidAddress(msg.Tags.Image), 'Image should be a valid arweave address!')
    local post = {
      title = msg.Tags.Title,
      description = msg.Tags.Description,
      addr = msg.From,
      date = msg.Timestamp,
      id = msg.Id
    }
    if type(msg.Tags.Image) == "string" then
      post.image = msg.Tags.Image
    end
    table.insert(posts, post)
    Handlers.utils.reply('posted!')(msg)
  end
)

Handlers.add(
  "Delete",
  Handlers.utils.hasMatchingTag('Action', 'Delete'),
  function(msg)
    assert(type(msg.Tags.ID) == 'string', 'ID is required!')
    local deleted = false
    for i, v in ipairs(posts) do
      if v.id == msg.Tags.ID then
	assert(msg.From == v.addr, "sender is not the owner!")
	table.remove(posts, i)
	deleted = true
	break
      end
    end
    assert(deleted, "post does not exisst!")
    Handlers.utils.reply('deleted!')(msg)
  end
)

Handlers.add(
  "List",
  Handlers.utils.hasMatchingTag('Action', 'List'),
  function(msg)
    local limit = nil
    local start = nil
    
    if type(msg.Tags.Limit) == "string" then
      limit = tonumber(msg.Tags.Limit)
      assert(type(limit) == 'number', 'Limit should be an integer!')
    end
    
    if type(msg.Tags.Start) == "string" then
      start = msg.Tags.Start
      assert(checkValidAddress(start), 'Start should be a valid arweave address!')
    end

    local sortedPosts = {}
    for i = 1, #posts do
      sortedPosts[i] = posts[i]
    end
    
    table.sort(
      sortedPosts,
      function(a, b)
	return a.date > b.date
      end
    )

    local _posts = {}
    local count = 0
    local started = false
    
    if start == nil then started = true end
    
    for i, v in ipairs(sortedPosts) do
      if started then
	table.insert(_posts, v)
	count = count + 1
      elseif start ~= nil and start == v.id then
	started = true
      end
      if limit ~= nil and limit <= count then break end
    end

    ao.send({ Target = msg.From, Data = json.encode(_posts) })
  end
)

Handlers.add(
  "Get",
  Handlers.utils.hasMatchingTag('Action', 'Get'),
  function(msg)
    assert(type(msg.Tags.ID) == 'string', 'ID is required!')
    local exists = false
    for i = 1, #posts do
      if posts[i].id == msg.Tags.ID then
	ao.send({ Target = msg.From, Data = json.encode(posts[i]) })
	exists = true
	break
      end
    end
    if not exists then
      ao.send({ Target = msg.From, Data = json.encode(nil) })
    end
  end
)
