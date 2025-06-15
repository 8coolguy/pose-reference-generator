
export function Prompt({input, setInput, submit, setVisible}){
    function handleChange(event){
        setInput(event.target.value);
    }
    return (
        <div className="fixed w-full bottom-0 bg-gray-800 p-4 shadow-lg border-t border-gray-700">
            <div className="max-w-3xl mx-auto flex items-end">
                <textarea
                value={input}
                onChange={handleChange}
                rows={1}
                placeholder="Describe where you would like to see your pose here..."
                className="flex-grow p-3 rounded-lg bg-gray-700 text-white resize-none
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            overflow-y-auto custom-scrollbar" // custom-scrollbar for styling scrollbar
                style={{ minHeight: '42px' }} // Ensure a minimum height
                />
                <button
                onClick={submit}
                disabled={!input.trim()} // Disable button if message is empty
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold
                            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                Send
                </button>
                <button onClick={()=>setVisible(true)}>help</button>
            </div>
        </div>
    )

}