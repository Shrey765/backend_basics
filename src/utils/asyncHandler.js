const asyncHandler = (fn) => {
    async (req, resizeBy, next) => {
        try {
            await fn(req, resizeBy, next)
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export default asyncHandler;


//agar promise k through krna ho to 
{/*const asyncHandler = (fn) => {
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(
            (err) => next(err)
        )
    }
} 

export default {asyncHandler}*/}