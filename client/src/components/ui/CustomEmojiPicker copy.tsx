          {emojiCategories.map((category) =>
              <button className='opacity-50 hover:opacity-100' onClick={() => scrollToCategory(category.name)}>
                <i className="material-symbols-outlined">{category.googleIcon}</i>
              </button>
          )}