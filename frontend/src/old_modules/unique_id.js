// Generation of unique IDs to use in forms 

let __caps_uuid_counter = 0;

function unique_id() {
    __caps_uuid_counter = __caps_uuid_counter + 1;
    return __caps_uuid_counter;
}

export default unique_id;